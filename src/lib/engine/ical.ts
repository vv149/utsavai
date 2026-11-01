import type { ScheduledTask } from "@/lib/contracts/plan";

/** Generates an RFC 5545 compliant .ics calendar string from scheduled tasks. */
export function generateIcs(
  tasks: readonly ScheduledTask[],
  eventName: string,
  eventDate: string
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FestiPlan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcalText(eventName)}`,
  ];

  for (const task of tasks) {
    if (task.done) continue;
    const uid = `${task.id}-${eventDate}@festiplan`;
    const dtStart = icalDate(task.startDate);
    const dtEnd = icalDate(task.dueDate);
    const now = icalTimestamp(new Date());

    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcalText(uid)}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeIcalText(task.title)}`,
      `CATEGORIES:${escapeIcalText(task.category)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return foldLines(lines.join("\r\n")) + "\r\n";
}

/** Escapes text per RFC 5545 §3.3.11. */
export function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Folds lines to 75 octets per RFC 5545 §3.1, handling multi-byte chars. */
export function foldLines(content: string): string {
  const encoder = new TextEncoder();
  const rawLines = content.split("\r\n");
  const folded: string[] = [];

  for (const line of rawLines) {
    const bytes = encoder.encode(line);
    if (bytes.length <= 75) {
      folded.push(line);
      continue;
    }

    let currentLine = "";
    let currentBytes = 0;
    const maxFirst = 75;
    const maxCont = 74; // continuation lines start with space

    for (const char of line) {
      const charBytes = encoder.encode(char).length;
      const _limit = currentLine === "" && folded.length === 0 ? maxFirst : (folded.length > 0 || currentLine !== "" ? (currentBytes === 0 ? maxCont : (currentBytes + charBytes <= (currentLine === line.substring(0, currentLine.length) && folded[folded.length - 1] === undefined ? maxFirst : maxCont) ? currentBytes + charBytes : 0)) : maxFirst);

      // ponytail: simplified fold logic
      if (currentBytes + charBytes > (folded.length === 0 && currentLine === "" ? 75 : 74)) {
        if (folded.length === 0 && currentLine.length > 0) {
          folded.push(currentLine);
        } else if (currentLine.length > 0) {
          folded.push(" " + currentLine);
        }
        currentLine = char;
        currentBytes = charBytes;
      } else {
        currentLine += char;
        currentBytes += charBytes;
      }
    }

    if (currentLine.length > 0) {
      if (folded.length > 0 && folded[folded.length - 1] !== line) {
        folded.push(" " + currentLine);
      } else if (folded.length === 0) {
        folded.push(currentLine);
      } else {
        folded.push(" " + currentLine);
      }
    }
  }

  return folded.join("\r\n");
}

function icalDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function icalTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}
