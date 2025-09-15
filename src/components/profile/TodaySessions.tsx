"use client";

import { useEffect, useMemo, useState } from "react";
import { createTypingSessionLog, type SessionLogEntry } from "@/lib/sessionLog";
import type { } from "react";

type TypingSession = {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
  mode: string;
  text: string;
  grossWPM?: number;
  netWPM?: number;
  keystrokes?: number;
  mistakes?: number;
  backspaces?: number;
  uncorrectedErrors?: number;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function TodaySessions() {
  const log = useMemo(() => createTypingSessionLog<TypingSession>(), []);
  const [entries, setEntries] = useState<SessionLogEntry<TypingSession>[]>([]);

  useEffect(() => {
    const refresh = () => {
      try {
        setEntries(log.readToday());
      } catch {
        setEntries([]);
      }
    };
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("session-log:typing:")) refresh();
    };
    const onInternal = (_e: Event) => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("sessionlog-update", onInternal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sessionlog-update", onInternal);
    };
  }, [log]);

  if (entries.length === 0) {
    return (
      <div className="border-2 border-gray-900 bg-white p-4 text-sm">
        No sessions yet today.
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-900 bg-white">
      <div className="border-b border-gray-200 px-4 py-2 text-xs font-bold tracking-wider">TODAY&apos;S SESSIONS</div>
      <ul className="divide-y divide-gray-200">
        {entries.map((e) => (
          <li key={e.id} className="px-4 py-3 flex items-center justify-between text-sm">
            <div className="flex items-baseline gap-3">
              <span className="text-gray-600 text-xs">Session {e.index}</span>
              <span className="font-semibold">{e.data.wpm} WPM</span>
              <span className="text-gray-600">{e.data.accuracy}%</span>
              <span className="text-gray-600">{formatTime(e.data.duration)}</span>
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[50%]">{e.data.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
