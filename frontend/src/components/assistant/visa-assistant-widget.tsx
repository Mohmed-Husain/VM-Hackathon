"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { askVisaAssistant } from "@/lib/api";
import type { AiAssistantSource } from "@/types/ai";

type AssistantTurn = {
  id: string;
  role: "assistant" | "user";
  content: string;
  mode?: "rules" | "openai";
  sources?: AiAssistantSource[];
};

const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  default: [
    "What documents do I need before I start?",
    "How early should I apply for the visa?",
    "What passport rules should I double-check?",
  ],
  "1": [
    "What applicant details should match my passport exactly?",
    "Does nationality have to match the passport bio page?",
    "Can I edit profile details later?",
  ],
  "2": [
    "How much passport validity do I need?",
    "Can I travel on a different passport than the one I apply with?",
    "What fields are auto-filled from OCR?",
  ],
  "3": [
    "How early should I apply before arrival?",
    "What travel details matter most in this draft?",
    "Do I need onward or return travel details?",
  ],
  "4": [
    "What are the passport scan file rules?",
    "What photo background should I use?",
    "Do supporting documents need to be in English?",
  ],
  "5": [
    "What should I review before submission?",
    "Is payment available yet in this MVP?",
    "Should I keep a copy of the final authorization?",
  ],
};

export function VisaAssistantWidget({
  accessToken,
  applicationId,
  currentStep,
}: Readonly<{
  accessToken: string;
  applicationId?: string;
  currentStep?: number;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(getSuggestions(currentStep));
  const [messages, setMessages] = useState<AssistantTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      content: buildWelcomeMessage(currentStep),
      mode: "rules",
    },
  ]);

  const heading = useMemo(() => {
    if (currentStep) {
      return `Step ${currentStep} guidance`;
    }

    return "Official visa guidance";
  }, [currentStep]);

  useEffect(() => {
    setSuggestions(getSuggestions(currentStep));
    setMessages((current) => {
      if (current.length !== 1 || current[0]?.id !== "welcome") {
        return current;
      }

      return [
        {
          ...current[0],
          content: buildWelcomeMessage(currentStep),
        },
      ];
    });
  }, [currentStep]);

  async function sendMessage(message: string) {
    if (!message.trim()) {
      return;
    }

    const content = message.trim();
    setError("");
    setDraftMessage("");
    setIsSending(true);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      },
    ]);

    try {
      const response = await askVisaAssistant(accessToken, {
        message: content,
        application_id: applicationId,
        current_step: currentStep,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          mode: response.mode,
          sources: response.sources,
        },
      ]);
      setSuggestions(response.suggested_prompts);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reach the visa assistant.");
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draftMessage);
  }

  return (
    <>
      {isOpen ? (
        <aside className="assistant-panel" aria-label="Visa assistant">
          <div className="assistant-panel-header">
            <div>
              <span className="eyebrow">Module 10</span>
              <strong>Visa Assistant</strong>
              <p className="assistant-caption">{heading}</p>
            </div>
            <button className="secondary-button inline" type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="assistant-message-list">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`assistant-message assistant-message-${message.role}`}
              >
                <span className="assistant-role">
                  {message.role === "assistant" ? `Assistant${message.mode === "openai" ? " (AI)" : ""}` : "You"}
                </span>
                <p>{message.content}</p>
                {message.sources?.length ? (
                  <div className="assistant-sources">
                    {message.sources.map((source) => (
                      <div className="assistant-source" key={`${message.id}-${source.topic_id}`}>
                        <strong>{source.title}</strong>
                        <span className="subtle">
                          {source.source_label} · {source.source_path}
                        </span>
                        <span>{source.excerpt}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="assistant-suggestion-row">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="assistant-suggestion"
                type="button"
                onClick={() => void sendMessage(suggestion)}
                disabled={isSending}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {error ? <div className="banner-error">{error}</div> : null}

          <form className="assistant-form" onSubmit={handleSubmit}>
            <textarea
              className="assistant-input"
              rows={3}
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="Ask about passport rules, photo specs, ETA guidance, or this draft step."
            />
            <button className="primary-button inline" type="submit" disabled={isSending}>
              {isSending ? "Thinking..." : "Send"}
            </button>
          </form>
        </aside>
      ) : null}

      <button
        className={`assistant-trigger ${isOpen ? "is-open" : ""}`}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        Ask visa assistant
      </button>
    </>
  );
}

function getSuggestions(currentStep?: number): string[] {
  if (currentStep) {
    return FALLBACK_SUGGESTIONS[String(currentStep)] ?? FALLBACK_SUGGESTIONS.default;
  }

  return FALLBACK_SUGGESTIONS.default;
}

function buildWelcomeMessage(currentStep?: number): string {
  if (currentStep) {
    return `I can help with Step ${currentStep} using the grounded rule set from the official visa guidance and the MVP scope.`;
  }

  return "I can answer common visa-process questions from the grounded rule set used in this MVP.";
}
