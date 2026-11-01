/** A single FAQ item used by both the rendered page and JSON-LD structured data. */
export interface FaqItem { readonly question: string; readonly answer: string }

/** FAQ items displayed on the landing page and embedded in JSON-LD. */
export const FAQ: readonly FaqItem[] = [
  {
    question: "What is UtsavAI?",
    answer:
      "UtsavAI is a free, AI-powered celebration and event planner designed for Indian weddings, birthdays, pujas, and community festivals. It generates personalized budgets, timelines, vendor suggestions, and creative ideas.",
  },
  {
    question: "How does the budget engine work?",
    answer:
      "The AI suggests category weights based on your event type and city. A pure TypeScript engine then allocates every rupee — no AI arithmetic. You can lock categories and redistribute the rest in real time.",
  },
  {
    question: "Is my plan private?",
    answer:
      "Yes. Plans are accessible only via their unique link and protected by an edit key. They are stored in Firestore with a 180-day TTL and automatically deleted after that.",
  },
  {
    question: "Does it cost anything?",
    answer:
      "UtsavAI is completely free. There are no sign-ups, no ads, and no hidden fees.",
  },
  {
    question: "Which cities are supported?",
    answer:
      "UtsavAI supports 15 major Indian cities including Mumbai, Delhi, Bangalore, Jaipur, Hyderabad, Chennai, Kolkata, Pune, and more. Vendor suggestions are localized to your chosen city.",
  },
];
