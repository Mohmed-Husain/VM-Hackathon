from __future__ import annotations

from functools import lru_cache
import json
import re

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User
from app.repositories.application_repository import ApplicationRepository
from app.schemas.ai import AiAssistantSource, AiChatRequest, AiChatResponse
from app.schemas.application import ApplicationFormData

try:
    from openai import AsyncOpenAI
except ImportError:  # pragma: no cover - optional dependency at runtime
    AsyncOpenAI = None

TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9]{3,}")
STOPWORDS = {
    "about",
    "after",
    "application",
    "apply",
    "can",
    "details",
    "draft",
    "for",
    "from",
    "have",
    "into",
    "need",
    "should",
    "step",
    "that",
    "the",
    "this",
    "visa",
    "what",
    "when",
    "with",
}


@lru_cache
def load_rules_dataset() -> dict:
    return json.loads(settings.visa_rules_path.read_text(encoding="utf-8"))


class AiService:
    def __init__(self) -> None:
        self.application_repository = ApplicationRepository()

    async def chat(
        self,
        session: AsyncSession,
        current_user: User,
        payload: AiChatRequest,
    ) -> AiChatResponse:
        application_context = None
        if payload.application_id is not None:
            application = await self.application_repository.get_for_user(session, payload.application_id, current_user.id)
            if application is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found.")

            application_context = {
                "application_id": str(application.id),
                "visa_category": application.visa_category,
                "current_step": application.current_step,
                "status": application.status,
                "form_data": ApplicationFormData.model_validate(application.form_data or {}),
            }

        dataset = load_rules_dataset()
        topics = self._select_topics(dataset["topics"], payload.message, payload.current_step)
        resolved_step = payload.current_step or (application_context["current_step"] if application_context else None)
        sources = [
            AiAssistantSource(
                topic_id=topic["id"],
                title=topic["title"],
                source_label=topic["source_label"],
                source_path=topic["source_path"],
                excerpt=topic["summary"],
            )
            for topic in topics
        ]
        suggested_prompts = self._get_suggestions(dataset["step_suggestions"], resolved_step)
        fallback_answer = self._build_rule_answer(payload.message, topics, application_context)

        answer = fallback_answer
        mode = "rules"
        openai_answer = await self._try_openai_answer(payload.message, topics, application_context, suggested_prompts)
        if openai_answer:
            answer = openai_answer
            mode = "openai"

        return AiChatResponse(
            answer=answer,
            mode=mode,
            sources=sources,
            suggested_prompts=suggested_prompts,
        )

    def _select_topics(self, topics: list[dict], message: str, current_step: int | None) -> list[dict]:
        query_tokens = [token for token in TOKEN_PATTERN.findall(message.lower()) if token not in STOPWORDS]
        ranked_topics: list[tuple[int, dict]] = []

        for topic in topics:
            score = 0
            haystacks = [
                topic.get("title", "").lower(),
                topic.get("summary", "").lower(),
                topic.get("content", "").lower(),
                " ".join(topic.get("keywords", [])).lower(),
            ]
            combined_haystack = " ".join(haystacks)

            for token in query_tokens:
                if token in combined_haystack:
                    score += 2

            for keyword in topic.get("keywords", []):
                keyword_lower = keyword.lower()
                if keyword_lower in message.lower():
                    score += 3

            if current_step is not None:
                if current_step == 4 and topic["id"] in {"required-uploads", "photo-specifications", "passport-scan-specifications"}:
                    score += 2
                if current_step == 2 and topic["id"] in {"passport-validity", "eta-travel"}:
                    score += 2
                if current_step == 5 and topic["id"] == "payment-hidden":
                    score += 3

            ranked_topics.append((score, topic))

        ranked_topics.sort(key=lambda item: item[0], reverse=True)
        chosen = [topic for score, topic in ranked_topics if score > 0][:3]
        if chosen:
            return chosen

        fallback_ids = ["required-uploads", "passport-validity", "apply-in-advance"]
        return [topic for topic in topics if topic["id"] in fallback_ids][:3]

    def _get_suggestions(self, suggestion_map: dict, current_step: int | None) -> list[str]:
        if current_step is not None:
            step_key = str(current_step)
            if step_key in suggestion_map:
                return suggestion_map[step_key]
        return suggestion_map["default"]

    def _build_rule_answer(self, message: str, topics: list[dict], application_context: dict | None) -> str:
        opening = "Here is the grounded guidance I can give from the official rules and this MVP scope."
        if application_context is not None:
            opening = (
                f"For your {application_context['visa_category']} draft at step {application_context['current_step']}, "
                "here is the grounded guidance I can give."
            )

        detail_lines = [topic["summary"] for topic in topics]
        if application_context is not None:
            form_data: ApplicationFormData = application_context["form_data"]
            contextual_lines = []
            if application_context["current_step"] <= 2 and not form_data.passport.expiry_date:
                contextual_lines.append("Your draft still needs a passport expiry date before the review step can be completed.")
            if application_context["current_step"] <= 4 and not form_data.documents.passport_scan_ready:
                contextual_lines.append("Your draft still needs the passport bio page upload before review can be completed.")
            if application_context["current_step"] <= 4 and not form_data.documents.applicant_photo_ready:
                contextual_lines.append("Your draft still needs the applicant photo upload before review can be completed.")
            detail_lines.extend(contextual_lines)

        closing = "If your question is outside these topics, I will stay conservative and point back to the official rule set rather than guess."
        return " ".join([opening, *detail_lines, closing]).strip()

    async def _try_openai_answer(
        self,
        message: str,
        topics: list[dict],
        application_context: dict | None,
        suggested_prompts: list[str],
    ) -> str | None:
        if not settings.openai_api_key or AsyncOpenAI is None:
            return None

        client = AsyncOpenAI(api_key=settings.openai_api_key)
        grounding_lines = [
            f"- {topic['title']}: {topic['content']}"
            for topic in topics
        ]
        context_line = "No application context was provided."
        if application_context is not None:
            context_line = (
                f"Application context: category={application_context['visa_category']}, "
                f"step={application_context['current_step']}, status={application_context['status']}."
            )

        prompt = (
            "Answer the user strictly from the grounded rule list below. "
            "If the rules do not support a claim, say that the MVP does not have that information. "
            "Keep the answer concise, helpful, and avoid hallucinating.\n\n"
            f"{context_line}\n"
            f"User question: {message}\n"
            f"Grounded rules:\n{chr(10).join(grounding_lines)}\n"
            f"Suggested follow-ups you may mention if relevant: {', '.join(suggested_prompts)}"
        )

        try:
            response = await client.responses.create(
                model=settings.openai_model,
                input=[
                    {"role": "system", "content": "You are a careful visa guidance assistant for a hackathon MVP."},
                    {"role": "user", "content": prompt},
                ],
                max_output_tokens=260,
            )
        except Exception:
            return None

        output_text = getattr(response, "output_text", "").strip()
        return output_text or None
