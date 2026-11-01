import type { Task, ScheduledTask } from "@/lib/contracts/plan";

/** Topologically sorts tasks by dependencies, falling back to flat list on cycles. */
export function topologicalSort(tasks: readonly Task[]): Task[] {
  const idSet = new Set(tasks.map((t) => t.id));
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const t of tasks) {
    adj.set(t.id, []);
    inDegree.set(t.id, 0);
  }

  for (const t of tasks) {
    for (const dep of t.depends) {
      if (!idSet.has(dep)) continue;
      adj.get(dep)!.push(t.id);
      inDegree.set(t.id, (inDegree.get(t.id) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adj.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  // ponytail: cycle detected → flat fallback by leadDays desc
  if (sorted.length < tasks.length) {
    return [...tasks].sort((a, b) => b.leadDays - a.leadDays);
  }

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  return sorted.map((id) => taskMap.get(id)!);
}

/** Computes scheduled dates for sorted tasks relative to an event date. */
export function scheduleTasks(
  sortedTasks: readonly Task[],
  eventDate: string,
  today: string
): ScheduledTask[] {
  const event = parseDate(eventDate);
  const now = parseDate(today);
  const totalLeadDays = Math.max(
    ...sortedTasks.map((t) => t.leadDays),
    1
  );
  const availableDays = Math.max(
    daysBetween(now, event),
    1
  );
  const compressionRatio = Math.min(availableDays / totalLeadDays, 1);

  return sortedTasks.map((task) => {
    const compressedLead = Math.max(
      Math.round(task.leadDays * compressionRatio),
      1
    );
    const dueDate = addDays(event, -compressedLead + 1);
    const startDate = maxDate(dueDate, now);

    return {
      id: task.id,
      title: task.title,
      category: task.category,
      startDate: formatDate(startDate),
      dueDate: formatDate(maxDate(dueDate, now)),
      done: false,
    };
  });
}

/** Checks if a task is overdue relative to today. */
export function isOverdue(task: ScheduledTask, today: string): boolean {
  return !task.done && today > task.dueDate;
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86_400_000);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function maxDate(a: Date, b: Date): Date {
  return a >= b ? a : b;
}
