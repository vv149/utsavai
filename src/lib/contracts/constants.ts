/** Event type presets for the planner form. */
export const EVENT_PRESETS = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Engagement", value: "engagement" },
  { label: "Baby Shower", value: "baby-shower" },
  { label: "Puja / Havan", value: "puja" },
  { label: "Housewarming", value: "housewarming" },
  { label: "Anniversary", value: "anniversary" },
  { label: "Community Festival", value: "community-festival" },
] as const;

/** Indian cities for the city dropdown. */
export const INDIAN_CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Indore",
  "Kochi",
  "Goa",
  "Udaipur",
] as const;

/** Tab IDs for the plan workspace. */
export const PLAN_TABS = [
  "overview",
  "ideas",
  "budget",
  "timeline",
  "vendors",
  "ask",
  "share",
] as const;

export type PlanTab = (typeof PLAN_TABS)[number];

/** Autosave debounce delay (ms). */
export const AUTOSAVE_DELAY_MS = 2000;

/** Application name. */
export const APP_NAME = "UtsavAI";

/** Application tagline. */
export const APP_TAGLINE = "AI-Powered Celebration Planner for India";
