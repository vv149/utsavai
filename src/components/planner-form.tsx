"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EVENT_PRESETS, INDIAN_CITIES } from "@/lib/contracts/constants";
import { formatInr } from "@/lib/engine/format";

/** Landing page form for creating a new celebration plan. */
export function PlannerForm() {
  const router = useRouter();
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState("");
  const [budgetInr, setBudgetInr] = useState("");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!eventType) errs.eventType = "Please select an event type";
    if (!date) errs.date = "Please select a date";
    if (!city) errs.city = "Please select a city";
    if (!guests || parseInt(guests) < 1) errs.guests = "Please enter the number of guests";
    if (!budgetInr || parseInt(budgetInr) < 1000) errs.budgetInr = "Minimum budget is ₹1,000";
    return errs;
  }, [eventType, date, city, guests, budgetInr]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        errorSummaryRef.current?.focus();
        return;
      }
      setErrors({});
      setLoading(true);

      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType,
            date,
            city,
            guests: parseInt(guests),
            budgetInr: parseInt(budgetInr),
            brief,
            language: "en",
          }),
        });

        if (!response.ok) {
          setErrors({ submit: "Failed to create plan. Please try again." });
          setLoading(false);
          return;
        }

        const data = await response.json();
        const editKey = data.editKey as string;
        router.push(`/plan/${data.id}#key=${editKey}`);
      } catch {
        setErrors({ submit: "Network error. Please try again." });
        setLoading(false);
      }
    },
    [eventType, date, city, guests, budgetInr, brief, validate, router]
  );

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Create celebration plan">
      {hasErrors && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="mb-6 p-4 rounded-lg text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid var(--color-error)" }}
        >
          <p className="font-medium mb-2" style={{ color: "var(--color-error)" }}>
            Please fix the following errors:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>
                <a
                  href={`#field-${field}`}
                  className="underline"
                  style={{ color: "var(--color-error)" }}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`field-${field}`)?.focus();
                  }}
                >
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="sr-only">Event details</legend>

        <div>
          <label htmlFor="field-eventType" className="block text-sm font-medium mb-1">
            Event Type
          </label>
          <select
            id="field-eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-base min-h-[44px]"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: `1px solid ${errors.eventType ? "var(--color-error)" : "var(--color-border)"}` }}
            aria-invalid={!!errors.eventType}
            aria-describedby={errors.eventType ? "err-eventType" : undefined}
          >
            <option value="">Select event type...</option>
            {EVENT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {errors.eventType && <p id="err-eventType" className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.eventType}</p>}
        </div>

        <div>
          <label htmlFor="field-date" className="block text-sm font-medium mb-1">
            Event Date
          </label>
          <input
            type="date"
            id="field-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-base min-h-[44px]"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: `1px solid ${errors.date ? "var(--color-error)" : "var(--color-border)"}` }}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "err-date" : undefined}
          />
          {errors.date && <p id="err-date" className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="field-city" className="block text-sm font-medium mb-1">
            City
          </label>
          <select
            id="field-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-base min-h-[44px]"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: `1px solid ${errors.city ? "var(--color-error)" : "var(--color-border)"}` }}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "err-city" : undefined}
          >
            <option value="">Select city...</option>
            {INDIAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.city && <p id="err-city" className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="field-guests" className="block text-sm font-medium mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            id="field-guests"
            min={1}
            max={100000}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-base min-h-[44px]"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: `1px solid ${errors.guests ? "var(--color-error)" : "var(--color-border)"}` }}
            aria-invalid={!!errors.guests}
            aria-describedby={errors.guests ? "err-guests" : undefined}
          />
          {errors.guests && <p id="err-guests" className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.guests}</p>}
        </div>

        <div>
          <label htmlFor="field-budgetInr" className="block text-sm font-medium mb-1">
            Budget (₹)
          </label>
          <input
            type="number"
            id="field-budgetInr"
            min={1000}
            max={100000000}
            value={budgetInr}
            onChange={(e) => setBudgetInr(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-base min-h-[44px]"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: `1px solid ${errors.budgetInr ? "var(--color-error)" : "var(--color-border)"}` }}
            aria-invalid={!!errors.budgetInr}
            aria-describedby={errors.budgetInr ? "err-budgetInr" : undefined}
          />
          {budgetInr && parseInt(budgetInr) >= 1000 && (
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {formatInr(parseInt(budgetInr))}
            </p>
          )}
          {errors.budgetInr && <p id="err-budgetInr" className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.budgetInr}</p>}
        </div>

        <div>
          <label htmlFor="field-brief" className="block text-sm font-medium mb-1">
            Additional Details <span style={{ color: "var(--color-text-muted)" }}>(optional)</span>
          </label>
          <textarea
            id="field-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            maxLength={2000}
            rows={3}
            className="w-full rounded-lg px-3 py-3 text-base"
            style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
            placeholder="Tell us about your vision, theme preferences, dietary requirements..."
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 rounded-lg px-4 py-3 text-base font-semibold min-h-[44px] transition-colors"
        style={{
          backgroundColor: loading ? "var(--color-text-muted)" : "var(--color-accent)",
          color: "white",
        }}
      >
        {loading ? "Creating your plan..." : "✨ Create My Plan"}
      </button>

      {errors.submit && (
        <p role="alert" className="text-sm mt-3 text-center" style={{ color: "var(--color-error)" }}>
          {errors.submit}
        </p>
      )}
    </form>
  );
}
