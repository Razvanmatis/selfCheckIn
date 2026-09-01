import { useEffect, useRef, useState, type FormEvent } from "react";
import { askKnowledge } from "../api/askKnowledge";
import { chatbotTranslations, type Language } from "../i18n/translations";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  isError?: boolean;
};

const STORAGE_KEY = "selfcheckin-chatbot-messages";
const POSITION_KEY = "selfcheckin-chatbot-position";

type Position = {
  x: number;
  y: number;
};

const makeMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const clampPosition = (position: Position): Position => {
  if (typeof window === "undefined") {
    return position;
  }

  const buttonSize = 56;
  const maxX = Math.max(16, window.innerWidth - buttonSize - 16);
  const maxY = Math.max(16, window.innerHeight - buttonSize - 16);

  return {
    x: Math.min(Math.max(position.x, 16), maxX),
    y: Math.min(Math.max(position.y, 16), maxY)
  };
};

const getDefaultPosition = (): Position => {
  if (typeof window === "undefined") {
    return { x: 16, y: 16 };
  }

  return clampPosition({
    x: window.innerWidth - 72,
    y: window.innerHeight - 96
  });
};

type ChatbotWidgetProps = {
  language: Language;
};

export function ChatbotWidget({ language }: ChatbotWidgetProps) {
  const chatbotT = chatbotTranslations[language];
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    if (typeof window === "undefined") {
      return { x: 16, y: 16 };
    }

    try {
      const saved = window.sessionStorage.getItem(POSITION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Position>;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          return clampPosition({ x: parsed.x, y: parsed.y });
        }
      }
    } catch {
      // Ignore invalid stored position.
    }

    return getDefaultPosition();
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage quota or privacy issues.
    }
  }, [messages]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(POSITION_KEY, JSON.stringify(position));
    } catch {
      // Ignore storage quota or privacy issues.
    }
  }, [position]);

  useEffect(() => {
    if (!isOpen || !messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isOpen]);

  const handleLauncherPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y
    };
    hasDraggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleLauncherPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragState.current || event.pointerId !== dragState.current.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
    }

    setPosition(
      clampPosition({
        x: dragState.current.originX + deltaX,
        y: dragState.current.originY + deltaY
      })
    );
  };

  const handleLauncherPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragState.current && event.pointerId === dragState.current.pointerId) {
      dragState.current = null;
    }
  };

  const submitQuestion = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: "user",
      text: trimmedQuestion
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const answer = await askKnowledge({
        question: trimmedQuestion,
        language
      });
      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId(),
          role: "assistant",
          text: answer
        }
      ]);
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId(),
          role: "assistant",
          text: errorText,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion();
  };

  return (
    <div className="chatbot" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <button
        type="button"
        className="chatbot__launcher"
        aria-label={isOpen ? chatbotT.closeLabel : chatbotT.openLabel}
        aria-expanded={isOpen}
        title={chatbotT.tooltip}
        onPointerDown={handleLauncherPointerDown}
        onPointerMove={handleLauncherPointerMove}
        onPointerUp={handleLauncherPointerUp}
        onPointerCancel={handleLauncherPointerUp}
        onClick={(event) => {
          if (hasDraggedRef.current) {
            event.preventDefault();
            hasDraggedRef.current = false;
            return;
          }

          setIsOpen((prev) => !prev);
        }}
      >
        <span aria-hidden="true">🤖</span>
      </button>

      {isOpen ? (
        <section className="chatbot__panel" aria-label={chatbotT.title}>
          <div className="chatbot__header">
            <div>
              <strong>{chatbotT.title}</strong>
              <div style={{ fontSize: "0.72rem", opacity: 0.85, marginTop: "0.15rem" }}>
                {chatbotT.subtitle}
              </div>
            </div>
            <button
              type="button"
              className="chatbot__close"
              aria-label={chatbotT.closeLabel}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot__messages" ref={messagesRef}>
            {messages.length === 0 ? (
              <p className="chatbot__empty">{chatbotT.empty}</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatbot__message chatbot__message--${message.role}`}
                >
                  <div
                    className={`chatbot__bubble${message.isError ? " chatbot__bubble--error" : ""}`}
                    role={message.isError ? "alert" : undefined}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}

            {isLoading ? (
              <div className="chatbot__message chatbot__message--assistant">
                <div className="chatbot__bubble chatbot__bubble--loading">{chatbotT.loading}</div>
              </div>
            ) : null}
          </div>

          <form className="chatbot__composer" onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={1}
              placeholder={chatbotT.placeholder}
              aria-label={chatbotT.inputAriaLabel}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitQuestion();
                }
              }}
            />
            <button type="submit" disabled={isLoading || !question.trim()}>
              {chatbotT.send}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
