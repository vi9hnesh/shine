"use client";

export type SessionLogEntry<T> = {
  id: string; // unique id per entry
  ts: number; // epoch ms
  index: number; // 1-based within the day
  data: T;
};

function todayId(date = new Date()): string {
  // YYYY-MM-DD in local time
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function keyFor(namespace: string, id: string): string {
  return `session-log:${namespace}:${id}`;
}

export class SessionLogManager<T> {
  constructor(private namespace: string) {}

  get todayKey(): string {
    return keyFor(this.namespace, todayId());
  }

  readToday(): SessionLogEntry<T>[] {
    try {
      const raw = localStorage.getItem(this.todayKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  writeToday(entries: SessionLogEntry<T>[]) {
    localStorage.setItem(this.todayKey, JSON.stringify(entries));
  }

  clearOld() {
    const prefix = `session-log:${this.namespace}:`;
    const keepKey = this.todayKey;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k !== keepKey) {
        localStorage.removeItem(k);
      }
    }
  }

  append(data: T): SessionLogEntry<T> {
    const entries = this.readToday();
    const entry: SessionLogEntry<T> = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      ts: Date.now(),
      index: entries.length + 1,
      data,
    };
    const next = [...entries, entry];
    this.writeToday(next);
    this.clearOld();
    try {
      window.dispatchEvent(new CustomEvent("sessionlog-update", { detail: { namespace: this.namespace } }));
    } catch {}
    return entry;
  }
}

// Convenience instance for typing sessions; type is imported at call sites.
export function createTypingSessionLog<T>() {
  return new SessionLogManager<T>("typing");
}

