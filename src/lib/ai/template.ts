import type { AiPlan, Brief } from "@/lib/contracts/plan";

/** Deterministic template fallback when AI generation fails twice. */
export function templateFallbackPlan(brief: Brief): AiPlan {
  const isWedding = /wedding|shaadi|vivah/i.test(brief.eventType);
  const isBirthday = /birthday|janamdin/i.test(brief.eventType);

  return {
    summary: `A ${brief.eventType} celebration in ${brief.city} for ${brief.guests} guests with a budget of ₹${brief.budgetInr.toLocaleString("en-IN")}. This plan was generated using our template system.`,
    ideas: [
      {
        name: isWedding ? "Royal Rajasthani" : isBirthday ? "Bollywood Bash" : "Classic Indian",
        concept: isWedding
          ? "A majestic celebration inspired by Rajasthani royal traditions"
          : isBirthday
            ? "A vibrant Bollywood-themed celebration with glamour and dance"
            : "A warm, traditional Indian celebration with modern touches",
        palette: ["#C41E3A", "#FFD700", "#1B4332", "#FFFFFF"],
        decor: ["Marigold garlands", "Fairy lights", "Traditional fabric drapes", "Brass accents"],
        food: ["Paneer tikka", "Biryani", "Gulab jamun", "Masala chai"],
        music: ["Bollywood classics", "Folk music", "DJ set"],
        signatureMoment: isWedding
          ? "Grand baraat procession with dhol and fireworks"
          : isBirthday
            ? "Surprise flash mob dance performance"
            : "Community blessing ceremony with lamp lighting",
      },
    ],
    budgetWeights: isWedding
      ? [
          { category: "Venue", weight: 0.30 },
          { category: "Catering", weight: 0.25 },
          { category: "Decoration", weight: 0.15 },
          { category: "Photography", weight: 0.10 },
          { category: "Entertainment", weight: 0.08 },
          { category: "Attire", weight: 0.07 },
          { category: "Invitations", weight: 0.05 },
        ]
      : [
          { category: "Venue", weight: 0.25 },
          { category: "Catering", weight: 0.30 },
          { category: "Decoration", weight: 0.20 },
          { category: "Entertainment", weight: 0.15 },
          { category: "Invitations", weight: 0.10 },
        ],
    tasks: [
      { id: "t1", title: "Book venue", category: "Venue", leadDays: 90, depends: [] },
      { id: "t2", title: "Hire caterer", category: "Catering", leadDays: 60, depends: ["t1"] },
      { id: "t3", title: "Order decorations", category: "Decoration", leadDays: 30, depends: ["t1"] },
      { id: "t4", title: "Send invitations", category: "Invitations", leadDays: 45, depends: [] },
      { id: "t5", title: "Book entertainment", category: "Entertainment", leadDays: 30, depends: [] },
      { id: "t6", title: "Final walkthrough", category: "Venue", leadDays: 3, depends: ["t2", "t3"] },
    ],
    vendors: [
      { category: "Venue", query: `${brief.eventType} venue in ${brief.city}`, tips: ["Visit at least 3 venues before deciding", "Check for hidden charges"] },
      { category: "Catering", query: `Caterer for ${brief.eventType} in ${brief.city}`, tips: ["Always do a tasting session", "Confirm they can handle your guest count"] },
    ],
    tips: [
      "Book vendors at least 2-3 months in advance",
      "Keep 10% contingency for unexpected expenses",
      "Create a day-of timeline and share with all vendors",
      "Assign a point person for vendor coordination",
    ],
  };
}
