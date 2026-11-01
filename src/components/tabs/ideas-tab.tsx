"use client";

import type { Idea } from "@/lib/contracts/plan";

/** Ideas tab showing theme ideas with details. */
export function IdeasTab({ ideas }: { ideas: readonly Idea[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Theme Ideas
      </h2>
      {ideas.map((idea, i) => (
        <article
          key={i}
          className="rounded-lg p-5"
          style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
            {idea.name}
          </h3>
          <p className="mb-3" style={{ color: "var(--color-text)" }}>{idea.concept}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {idea.palette.map((color, j) => (
              <span
                key={j}
                className="inline-block w-8 h-8 rounded-full border-2"
                style={{ backgroundColor: color, borderColor: "var(--color-border)" }}
                role="img"
                aria-label={`Color: ${color}`}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <IdeaSection title="Decor" items={idea.decor} />
            <IdeaSection title="Food" items={idea.food} />
            <IdeaSection title="Music" items={idea.music} />
            <div>
              <h4 className="font-medium mb-1" style={{ color: "var(--color-gold)" }}>Signature Moment</h4>
              <p style={{ color: "var(--color-text)" }}>{idea.signatureMoment}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function IdeaSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h4 className="font-medium mb-1" style={{ color: "var(--color-gold)" }}>{title}</h4>
      <ul className="list-disc pl-4">
        {items.map((item, i) => (
          <li key={i} style={{ color: "var(--color-text)" }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
