/** Formats an amount in Indian Rupees with proper grouping. */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats a plain number with Indian grouping. */
export function formatIndianNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

/** Formats a date string as a human-readable label. */
export function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Returns a countdown label relative to today. */
export function countdownLabel(eventDate: string, today: string): string {
  const event = parseDateParts(eventDate);
  const now = parseDateParts(today);
  const diffMs = event.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays < 0) return "Celebrated";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days to go`;
}

/** Formats a percentage with one decimal place. */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function parseDateParts(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
