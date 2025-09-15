"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTypingSettings } from "./typingSettings";

const INTEREST_OPTIONS = [
  { key: "punctuation", label: "Punctuation" },
  { key: "numbers", label: "Numbers" },
  { key: "letters", label: "Letters" },
  { key: "coding", label: "Coding" },
  { key: "words", label: "Words" },
  { key: "mixed", label: "Mixed" },
];

export default function TypingSettingsPanel() {
  const [settings, setSettings, reset] = useTypingSettings();

  const updateInterest = (key: string, checked: boolean) => {
    const list = new Set(settings.interests);
    if (checked) list.add(key); else list.delete(key);
    setSettings({ interests: Array.from(list) });
  };

  return (
    <div className="relative">
      <Card className="border-2 border-black" style={{ borderRadius: 0 }}>
        <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-bold flex flex-col gap-1">
                  Sessions per day
                  <Input
                    type="number"
                    value={settings.sessionsPerDay}
                    min={0}
                    onChange={(e) => setSettings({ sessionsPerDay: Math.max(0, parseInt(e.target.value || "0", 10)) })}
                    className="border-2 border-black h-9"
                    style={{ borderRadius: 0 }}
                  />
                </label>
                <label className="text-sm font-bold flex flex-col gap-1">
                  Session length (min)
                  <select
                    value={settings.sessionDurationMin}
                    onChange={(e) => setSettings({ sessionDurationMin: Number(e.target.value) as 5 | 15 | 30 | 60 })}
                    className="border-2 border-black h-9 px-2"
                    style={{ borderRadius: 0 }}
                  >
                    {[5, 15, 30, 60].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold flex flex-col gap-1">
                  Target WPM
                  <Input
                    type="number"
                    value={settings.targetWPM}
                    min={0}
                    onChange={(e) => setSettings({ targetWPM: Math.max(0, parseInt(e.target.value || "0", 10)) })}
                    className="border-2 border-black h-9"
                    style={{ borderRadius: 0 }}
                  />
                </label>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-bold">Areas of interest</div>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => {
                    const checked = settings.interests.includes(opt.key);
                    return (
                      <label key={opt.key} className={`px-2 py-1 border-2 cursor-pointer ${checked ? 'bg-black text-white' : 'bg-white text-black'} border-black text-xs font-bold`} style={{ borderRadius: 0 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => updateInterest(opt.key, e.target.checked)}
                          className="hidden"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-2 border-black"
                  style={{ borderRadius: 0 }}
                  onClick={() => reset()}
                >
                  Reset to defaults
                </Button>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
