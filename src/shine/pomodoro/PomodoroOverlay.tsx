"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Timer as TimerIcon } from "lucide-react";

export default function PomodoroOverlay() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateFromStorage = () => {
      const saved = localStorage.getItem("pomodoro-timer");
      if (saved) {
        try {
          const { timeLeft: savedTimeLeft, isActive: savedActive, isBreak: savedBreak, lastUpdated } = JSON.parse(saved);
          const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
          const newTimeLeft = Math.max(0, savedTimeLeft - elapsed);

          if (savedActive && newTimeLeft <= 0) {
            localStorage.setItem("pomodoro-timer", JSON.stringify({
              timeLeft: 0,
              isActive: false,
              isBreak: savedBreak,
              lastUpdated: Date.now(),
            }));
            setTimeLeft(0);
            setIsActive(false);
            return;
          }

          setTimeLeft(newTimeLeft);
          setIsActive(savedActive && newTimeLeft > 0);
        } catch {
          setIsActive(false);
        }
      } else {
        setIsActive(false);
      }
    };

    updateFromStorage();
    const interval = setInterval(updateFromStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isActive) return null;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 border-2 border-black bg-white px-3 py-2 shadow-lg">
      <span className="font-mono text-lg">
        {minutes}:{seconds}
      </span>
      <Button
        size="icon"
        variant="outline"
        onClick={() => router.push("/pomodoro")}
      >
        <TimerIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

