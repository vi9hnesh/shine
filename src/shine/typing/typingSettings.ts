"use client";

import { useSettings } from "@/lib/settings";

export type TypingSettings = {
  sessionsPerDay: number; // goal
  sessionDurationMin: 5 | 15 | 30 | 60; // what is a session
  targetWPM: number; // user's target
  interests: string[]; // user area(s) of interest
};

export const defaultTypingSettings: TypingSettings = {
  sessionsPerDay: 3,
  sessionDurationMin: 15,
  targetWPM: 50,
  interests: [],
};

export function useTypingSettings() {
  return useSettings<TypingSettings>("typing", defaultTypingSettings);
}

