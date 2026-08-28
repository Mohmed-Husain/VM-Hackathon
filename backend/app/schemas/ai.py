from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AiChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    session_id: str | None = None
    application_id: UUID | None = None
    current_step: int | None = Field(default=None, ge=1, le=5)


class AiAssistantSource(BaseModel):
    topic_id: str
    title: str
    source_label: str
    source_path: str
    excerpt: str


class AiChatResponse(BaseModel):
    answer: str
    session_id: str
    mode: Literal["rules", "langchain"]
    sources: list[AiAssistantSource]
    suggested_prompts: list[str]
