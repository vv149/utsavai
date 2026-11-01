"use client";

import { useState, useCallback, useRef } from "react";

/** Ask UtsavAI tab with streaming responses. */
export function AskTab({ planId }: { planId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  const handleAsk = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!question.trim() || loading) return;

      setLoading(true);
      setAnswer("");

      try {
        const response = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, question }),
        });

        if (!response.ok || !response.body) {
          setAnswer("Sorry, something went wrong. Please try again.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let text = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAnswer(text);
        }
      } catch {
        setAnswer("Network error. Please try again.");
      } finally {
        setLoading(false);
        answerRef.current?.focus();
      }
    },
    [question, loading, planId]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Ask UtsavAI
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Ask questions about your plan, get suggestions, or explore alternatives.
      </p>

      <form onSubmit={handleAsk} className="flex gap-2" aria-label="Ask a question">
        <label htmlFor="ask-question" className="sr-only">Your question</label>
        <input
          type="text"
          id="ask-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What are some unique mehendi ideas?"
          maxLength={2000}
          className="flex-1 rounded-lg px-3 py-3 text-base min-h-[44px]"
          style={{
            backgroundColor: "var(--color-bg-input)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg px-6 py-3 font-medium min-h-[44px] transition-colors"
          style={{
            backgroundColor: loading ? "var(--color-text-muted)" : "var(--color-accent)",
            color: "white",
          }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>

      {answer && (
        <div
          ref={answerRef}
          tabIndex={-1}
          aria-live="polite"
          className="rounded-lg p-4 whitespace-pre-wrap"
          style={{
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}
