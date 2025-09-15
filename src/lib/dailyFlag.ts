"use client";

// A reusable daily-decaying counter stored in localStorage.
// - Namespaced so multiple features can use their own counters
// - Decrements by 1 per day elapsed when tick() is called
// - Defaults to 0 when not set

function todayId(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export class DailyDecayingCounter {
  private keyValue: string;
  private keyDate: string;

  constructor(private namespace: string) {
    this.keyValue = `shine.daily:${namespace}:value`;
    this.keyDate = `shine.daily:${namespace}:date`;
  }

  get(): number {
    try {
      const raw = localStorage.getItem(this.keyValue);
      const n = raw == null ? 0 : Number(raw);
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }

  set(n: number) {
    try {
      localStorage.setItem(this.keyValue, String(Math.max(0, Math.floor(n))));
      // also update the date stamp so a manual set feels immediate
      localStorage.setItem(this.keyDate, todayId());
      window.dispatchEvent(
        new CustomEvent("dailyflag:update", { detail: { namespace: this.namespace } })
      );
    } catch {}
  }

  /** Decrement by 1 per elapsed day. Returns the updated value. */
  tick(): number {
    try {
      const today = todayId();
      const last = localStorage.getItem(this.keyDate);
      const cur = this.get();
      if (!last) {
        localStorage.setItem(this.keyDate, today);
        return cur;
      }
      if (last === today) return cur;
      // Compute day difference in local time
      const lastDate = new Date(last + "T00:00:00");
      const todayDate = new Date(today + "T00:00:00");
      const diffDays = Math.max(0, Math.floor((todayDate.getTime() - lastDate.getTime()) / (24 * 3600 * 1000)));
      const next = Math.max(0, cur - diffDays);
      localStorage.setItem(this.keyValue, String(next));
      localStorage.setItem(this.keyDate, today);
      window.dispatchEvent(
        new CustomEvent("dailyflag:update", { detail: { namespace: this.namespace } })
      );
      return next;
    } catch {
      return this.get();
    }
  }
}

// Convenience factory for the requested learning flag
export function createLearningCounter() {
  return new DailyDecayingCounter("user_learning");
}

