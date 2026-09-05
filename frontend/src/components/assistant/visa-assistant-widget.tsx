"use client";

import React, { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import { askVisaAssistant } from "@/lib/api";
import type { AiAssistantSource } from "@/types/ai";

/* === Types === */

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  fullContent?: string;
  isStreaming?: boolean;
  timestamp: string;
  mode?: "rules" | "langchain";
  sources?: AiAssistantSource[];
  suggestedPrompts?: string[];
  feedback?: "like" | "dislike";
};

/* === Fallback Suggestions Per Step === */

const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  default: [
    "What documents do I need before I start?",
    "How early should I apply for the visa?",
    "What passport rules should I double-check?",
  ],
  "1": [
    "What applicant details must match my passport?",
    "Does nationality have to match the passport bio page?",
    "Can I edit profile details later in this draft?",
  ],
  "2": [
    "How much passport validity do I need?",
    "Can I travel on a different passport than applied?",
    "What passport fields are auto-filled from OCR?",
  ],
  "3": [
    "How early should I apply before my arrival date?",
    "What travel details matter most in this draft?",
    "Do I need onward or return ticket details?",
  ],
  "4": [
    "What are the passport scan upload specifications?",
    "What photo background and dimensions should I use?",
    "Do supporting documents need to be in English?",
  ],
  "5": [
    "What should I double check before final submission?",
    "Is payment available yet in this MVP?",
    "Should I print a paper copy of the ETA?",
  ],
};

/* === Helpers === */

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getSuggestions(step?: number): string[] {
  if (step) return FALLBACK_SUGGESTIONS[String(step)] ?? FALLBACK_SUGGESTIONS.default;
  return FALLBACK_SUGGESTIONS.default;
}

const STEP_PROACTIVE_TIPS: Record<number, { tip: string; title: string }> = {
  1: {
    title: "Personal Details Tip",
    tip: "Ensure your first and last names match the Machine Readable Zone (MRZ) of your passport exactly. Any middle name should be included in the First Name field.",
  },
  2: {
    title: "Passport Validity Tip",
    tip: "Indian eVisas strictly require at least **6 months validity** remaining on your passport from your intended arrival date, with at least two blank passport pages.",
  },
  3: {
    title: "Travel Plan Tip",
    tip: "e-Tourist visas permit entry through 31 designated international airports and 5 seaports. Make sure your departure flight falls within the validity window.",
  },
  4: {
    title: "Smart Uploads Tip",
    tip: "Upload a recent color photograph with a **clean white background** and **1:1 square aspect ratio**. Our auto-cropper and compression system will automatically optimize your files to consular limits.",
  },
  5: {
    title: "Review & Seal Tip",
    tip: "Carefully double-check your passport number and expiry date before sealing. Once sealed and payment is processed, consular records are locked.",
  },
};

function buildWelcome(step?: number): string {
  if (step) {
    const proactive = STEP_PROACTIVE_TIPS[step];
    return `### Step ${step} Guidance Ready\n\nI can help you review requirements, document rules, and specific fields for **Step ${step}**.\n\n${proactive ? `💡 **Proactive Tip:** ${proactive.tip}\n\n` : ""}- Ask any question below or pick a suggested topic to get started.`;
  }
  return "### Official Smart eVisa Guidance\n\nI am your official eVisa assistant. Ask me anything about:\n\n- **Passport & photo specifications**\n- **Visa sub-categories and validity**\n- **Authorized ports of entry**\n- **Application workflow and document uploads**";
}


/* === Rich Markdown Message Renderer === */

export function FormattedChatMessage({
  content,
  isStreaming = false,
}: Readonly<{
  content: string;
  isStreaming?: boolean;
}>) {
  const renderedElements = useMemo(() => {
    return parseMarkdownToReact(content);
  }, [content]);

  return (
    <div className="chat-markdown-body">
      {renderedElements}
      {isStreaming && <span className="chat-cursor" aria-hidden="true">_</span>}
    </div>
  );
}

function parseMarkdownToReact(text: string): React.ReactNode[] {
  if (!text) return [];

  const rawBlocks = text.split(/\n\s*\n/);
  const elements: React.ReactNode[] = [];

  rawBlocks.forEach((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // 1. Horizontal Rule
    if (/^---$|^___$|^\*\*\*$/.test(trimmed)) {
      elements.push(<hr key={`hr-${blockIdx}`} className="chat-divider" />);
      return;
    }

    // 2. Blockquote / Callout Note
    if (trimmed.startsWith(">")) {
      const quoteText = trimmed.replace(/^>\s*/gm, "");
      elements.push(
        <div key={`quote-${blockIdx}`} className="chat-callout">
          <span className="chat-callout-icon">i</span>
          <div className="chat-callout-text">{renderInline(quoteText)}</div>
        </div>
      );
      return;
    }

    // 3. Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={`h3-${blockIdx}`} className="chat-heading chat-heading-3">
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={`h2-${blockIdx}`} className="chat-heading chat-heading-2">
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2 key={`h1-${blockIdx}`} className="chat-heading chat-heading-1">
          {renderInline(trimmed.replace(/^#\s+/, ""))}
        </h2>
      );
      return;
    }

    // 4. Bullet Lists
    const lines = trimmed.split("\n");
    const isBulletList = lines.every((line) => /^\s*[-*]\s+/.test(line));
    if (isBulletList && lines.length > 0) {
      elements.push(
        <ul key={`ul-${blockIdx}`} className="chat-bullet-list">
          {lines.map((line, lineIdx) => {
            const itemText = line.replace(/^\s*[-*]\s+/, "");
            return (
              <li key={`li-${blockIdx}-${lineIdx}`} className="chat-bullet-item">
                <span className="chat-bullet-dot" />
                <span className="chat-bullet-content">{renderInline(itemText)}</span>
              </li>
            );
          })}
        </ul>
      );
      return;
    }

    // 5. Numbered Lists
    const isNumberedList = lines.every((line) => /^\s*\d+\.\s+/.test(line));
    if (isNumberedList && lines.length > 0) {
      elements.push(
        <ol key={`ol-${blockIdx}`} className="chat-numbered-list">
          {lines.map((line, lineIdx) => {
            const match = line.match(/^\s*(\d+)\.\s+(.*)/);
            const num = match ? match[1] : String(lineIdx + 1);
            const itemText = match ? match[2] : line;
            return (
              <li key={`oli-${blockIdx}-${lineIdx}`} className="chat-numbered-item">
                <span className="chat-number-badge">{num}</span>
                <span className="chat-numbered-content">{renderInline(itemText)}</span>
              </li>
            );
          })}
        </ol>
      );
      return;
    }

    // 6. Mixed lines containing some bullets
    const hasSomeBullets = lines.some((line) => /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line));
    if (hasSomeBullets) {
      const mixedElements: React.ReactNode[] = [];
      let currentBulletGroup: string[] = [];
      let currentNumberedGroup: { num: string; text: string }[] = [];

      const flushBullets = () => {
        if (currentBulletGroup.length > 0) {
          mixedElements.push(
            <ul key={`sub-ul-${blockIdx}-${mixedElements.length}`} className="chat-bullet-list">
              {currentBulletGroup.map((txt, idx) => (
                <li key={`sub-li-${idx}`} className="chat-bullet-item">
                  <span className="chat-bullet-dot" />
                  <span className="chat-bullet-content">{renderInline(txt)}</span>
                </li>
              ))}
            </ul>
          );
          currentBulletGroup = [];
        }
      };

      const flushNumbered = () => {
        if (currentNumberedGroup.length > 0) {
          mixedElements.push(
            <ol key={`sub-ol-${blockIdx}-${mixedElements.length}`} className="chat-numbered-list">
              {currentNumberedGroup.map((item, idx) => (
                <li key={`sub-oli-${idx}`} className="chat-numbered-item">
                  <span className="chat-number-badge">{item.num}</span>
                  <span className="chat-numbered-content">{renderInline(item.text)}</span>
                </li>
              ))}
            </ol>
          );
          currentNumberedGroup = [];
        }
      };

      lines.forEach((line, lIdx) => {
        if (/^\s*[-*]\s+/.test(line)) {
          flushNumbered();
          currentBulletGroup.push(line.replace(/^\s*[-*]\s+/, ""));
        } else if (/^\s*(\d+)\.\s+(.*)/.test(line)) {
          flushBullets();
          const match = line.match(/^\s*(\d+)\.\s+(.*)/);
          if (match) {
            currentNumberedGroup.push({ num: match[1], text: match[2] });
          }
        } else if (line.trim()) {
          flushBullets();
          flushNumbered();
          mixedElements.push(
            <p key={`sub-p-${blockIdx}-${lIdx}`} className="chat-paragraph">
              {renderInline(line)}
            </p>
          );
        }
      });

      flushBullets();
      flushNumbered();

      elements.push(<div key={`mixed-${blockIdx}`}>{mixedElements}</div>);
      return;
    }

    // 7. Regular Paragraph
    elements.push(
      <p key={`p-${blockIdx}`} className="chat-paragraph">
        {renderInline(trimmed)}
      </p>
    );
  });

  return elements;
}

function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="chat-bold-highlight">
          {inner}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code key={index} className="chat-inline-code">
          {inner}
        </code>
      );
    }

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-link"
        >
          {label}
        </a>
      );
    }

    if (part.includes("\n")) {
      const subLines = part.split("\n");
      return (
        <React.Fragment key={index}>
          {subLines.map((subLine, sIdx) => (
            <React.Fragment key={sIdx}>
              {subLine}
              {sIdx < subLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    return part;
  });
}

/* === Main Widget Component === */

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
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: buildWelcome(currentStep),
      timestamp: formatCurrentTime(),
      mode: "rules",
      suggestedPrompts: getSuggestions(currentStep),
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastUserMessageRef = useRef<string>("");
  const lastStepRef = useRef<number | undefined>(currentStep);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isSending]);

  useEffect(() => {
    if (!currentStep) return;

    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.id === "welcome") {
        return [
          {
            ...prev[0],
            content: buildWelcome(currentStep),
            suggestedPrompts: getSuggestions(currentStep),
          },
        ];
      }

      if (lastStepRef.current !== currentStep) {
        lastStepRef.current = currentStep;
        const proactive = STEP_PROACTIVE_TIPS[currentStep];
        if (proactive) {
          const tipMsg: ChatMessage = {
            id: `step-tip-${currentStep}-${Date.now()}`,
            role: "assistant",
            content: `### 💡 Proactive Step ${currentStep} Guidance\n\n${proactive.tip}`,
            timestamp: formatCurrentTime(),
            mode: "rules",
            suggestedPrompts: getSuggestions(currentStep),
          };
          return [...prev, tipMsg];
        }
      }

      return prev;
    });
  }, [currentStep]);


  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom("auto");
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);
    if (inputRef.current) {
      if (!val) {
        inputRef.current.style.height = "42px";
        inputRef.current.style.overflowY = "hidden";
      } else {
        inputRef.current.style.height = "42px";
        const scrollH = inputRef.current.scrollHeight;
        if (scrollH > 42) {
          inputRef.current.style.height = `${Math.min(scrollH, 120)}px`;
          inputRef.current.style.overflowY = scrollH > 120 ? "auto" : "hidden";
        } else {
          inputRef.current.style.overflowY = "hidden";
        }
      }
    }
  };

  const handleResetChat = () => {
    setSessionId(generateSessionId());
    setError("");
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: buildWelcome(currentStep),
        timestamp: formatCurrentTime(),
        mode: "rules",
        suggestedPrompts: getSuggestions(currentStep),
      },
    ]);
  };

  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const streamResponseText = (
    msgId: string,
    fullText: string,
    suggestedPrompts: string[],
    mode: "rules" | "langchain"
  ) => {
    const chunkSize = 4;
    let currentIdx = 0;

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= fullText.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  content: fullText,
                  isStreaming: false,
                  suggestedPrompts,
                  mode,
                }
              : m
          )
        );
        setIsSending(false);
      } else {
        const slice = fullText.slice(0, currentIdx);
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, content: slice, isStreaming: true } : m))
        );
      }
    }, 18);
  };

  async function sendMessage(message: string) {
    const text = message.trim();
    if (!text || isSending) return;

    setError("");
    setDraft("");
    if (inputRef.current) {
      inputRef.current.style.height = "42px";
      inputRef.current.style.overflowY = "hidden";
    }

    lastUserMessageRef.current = text;
    setIsSending(true);

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: text,
        timestamp: formatCurrentTime(),
      },
    ]);

    try {
      const res = await askVisaAssistant(accessToken, {
        message: text,
        session_id: sessionId,
        application_id: applicationId,
        current_step: currentStep,
      });

      if (res.session_id) {
        setSessionId(res.session_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "assistant",
          content: "",
          fullContent: res.answer,
          isStreaming: true,
          timestamp: formatCurrentTime(),
          mode: res.mode,
          suggestedPrompts: [],
        },
      ]);

      streamResponseText(aiMsgId, res.answer, res.suggested_prompts, res.mode);
    } catch (err) {
      setIsSending(false);
      setError(err instanceof Error ? err.message : "Unable to reach the assistant.");
    }
  }

  const handleRegenerate = () => {
    if (lastUserMessageRef.current) {
      void sendMessage(lastUserMessageRef.current);
    }
  };

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(draft);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(draft);
    }
  }

  const heading = currentStep ? `Step ${currentStep} Active Guidance` : "Official e-Visa Intelligence";

  return (
    <>
      {isOpen && (
        <aside className="assistant-panel" aria-label="Visa assistant">
          {/* Fixed Header */}
          <div className="assistant-header">
            <div className="assistant-header-left">
              <div className="assistant-bot-badge">
                <span className="assistant-bot-sparkle">*</span>
              </div>
              <div className="assistant-header-info">
                <div className="assistant-title-row">
                  <strong className="assistant-title">Visa Assistant</strong>
                  <span className="assistant-online-pill">Online</span>
                </div>
                <span className="assistant-subtitle">{heading}</span>
              </div>
            </div>

            <div className="assistant-header-actions">
              <button
                className="assistant-header-btn"
                type="button"
                onClick={handleResetChat}
                title="Start new conversation"
                aria-label="New chat"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
              </button>
              <button
                className="assistant-close"
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close assistant"
              >
                x
              </button>
            </div>
          </div>

          {/* Scrollable Conversation History */}
          <div className="assistant-messages" ref={listRef}>
            {messages.map((msg, index) => {
              const isLatestAssistant =
                msg.role === "assistant" &&
                index === messages.length - 1 &&
                !msg.isStreaming;

              return (
                <article key={msg.id} className={`assistant-msg assistant-msg--${msg.role}`}>
                  {/* Header Row */}
                  <div className="assistant-msg-header">
                    <span className="assistant-msg-role">
                      {msg.role === "assistant" ? (
                        <>
                          <span className="assistant-role-icon">*</span>
                          Visa Assistant {msg.mode === "langchain" ? "• AI" : "• Rules"}
                        </>
                      ) : (
                        "You"
                      )}
                    </span>
                    <span className="assistant-msg-time">{msg.timestamp}</span>
                  </div>

                  {/* Formatted Content */}
                  <div className="assistant-msg-body">
                    <FormattedChatMessage content={msg.content} isStreaming={msg.isStreaming} />
                  </div>

                  {/* Assistant Message Actions Toolbar */}
                  {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                    <div className="assistant-msg-actions">
                      <button
                        className="assistant-action-btn"
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <span className="action-check">ok</span> Copied
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>

                      {isLatestAssistant && (
                        <button
                          className="assistant-action-btn"
                          type="button"
                          onClick={handleRegenerate}
                          title="Regenerate this response"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                          Regenerate
                        </button>
                      )}
                    </div>
                  )}

                  {/* Contextual Suggestion Chips */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && !msg.isStreaming && (
                    <div className="assistant-inline-chips">
                      <span className="assistant-chips-label">Suggested follow-ups:</span>
                      <div className="assistant-chips-row">
                        {msg.suggestedPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            className="assistant-chip-btn"
                            type="button"
                            onClick={() => void sendMessage(prompt)}
                            disabled={isSending}
                          >
                            <span>{prompt}</span>
                            <span className="assistant-chip-arrow">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {/* Thinking / Loading State */}
            {isSending && (
              <div className="assistant-thinking-card">
                <div className="assistant-thinking-avatar">*</div>
                <div className="assistant-thinking-text">
                  <span>Visa Assistant is thinking</span>
                  <span className="assistant-thinking-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="assistant-error-strip">
              <span className="error-icon">!</span>
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} className="error-dismiss">x</button>
            </div>
          )}

          {/* Permanently Anchored Input Bar */}
          <form className="assistant-input-bar" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="assistant-input"
              rows={1}
              value={draft}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about visa rules, documents, or ETA..."
              disabled={isSending}
              aria-label="Ask visa assistant"
            />
            <button
              className="assistant-send-btn"
              type="submit"
              disabled={isSending || !draft.trim()}
              title="Send message (Enter)"
            >
              {isSending ? (
                <span className="send-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
          <div className="assistant-footer-caption">
            <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for newline</span>
          </div>
        </aside>
      )}

      {/* Floating Action Button (FAB) Trigger */}
      <button
        className={`assistant-trigger ${isOpen ? "is-open" : ""}`}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close visa assistant" : "Open visa assistant"}
      >
        {isOpen ? (
          <>
            <span className="assistant-trigger-icon">x</span>
            <span>Close Chat</span>
          </>
        ) : (
          <>
            <span className="assistant-trigger-sparkle">*</span>
            <span>Ask Visa Assistant</span>
          </>
        )}
      </button>
    </>
  );
}
