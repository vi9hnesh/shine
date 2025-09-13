"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Timer as TimerIcon,
  PictureInPicture2 as PiPIcon,
} from "lucide-react";

export default function PomodoroOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    const updateFromStorage = () => {
      const saved = localStorage.getItem("pomodoro-timer");
      if (saved) {
        try {
          const {
            timeLeft: savedTimeLeft,
            isActive: savedActive,
            isBreak: savedBreak,
            lastUpdated,
          } = JSON.parse(saved);
          const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
          const newTimeLeft = Math.max(0, savedTimeLeft - elapsed);

          if (savedActive) {
            if (newTimeLeft <= 0) {
              localStorage.setItem(
                "pomodoro-timer",
                JSON.stringify({
                  timeLeft: 0,
                  isActive: false,
                  isBreak: savedBreak,
                  lastUpdated: Date.now(),
                })
              );
              setTimeLeft(0);
              setIsActive(false);
              return;
            }

            localStorage.setItem(
              "pomodoro-timer",
              JSON.stringify({
                timeLeft: newTimeLeft,
                isActive: true,
                isBreak: savedBreak,
                lastUpdated: Date.now(),
              })
            );
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

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const openPiP = async () => {
    const dpp = (window as Window & {
      documentPictureInPicture?: {
        requestWindow: (options: { width: number; height: number }) => Promise<Window>;
      };
    }).documentPictureInPicture;
    if (dpp) {
      try {
        const win = await dpp.requestWindow({ width: 160, height: 64 });
        setPipWindow(win);
        const doc = win.document;
        doc.body.style.margin = "0";
        doc.body.style.display = "flex";
        doc.body.style.alignItems = "center";
        doc.body.style.justifyContent = "center";
        doc.body.style.fontFamily = "monospace";
        doc.body.style.fontSize = "24px";
        const span = doc.createElement("span");
        span.id = "pip-timer";
        span.textContent = `${minutes}:${seconds}`;
        doc.body.appendChild(span);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (pipWindow) {
      const el = pipWindow.document.getElementById("pip-timer");
      if (el) el.textContent = `${minutes}:${seconds}`;
    }
  }, [minutes, seconds, pipWindow]);

  useEffect(() => {
    if (pathname.startsWith("/pomodoro") && pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pathname, pipWindow]);

  useEffect(() => {
    if (!isActive && pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [isActive, pipWindow]);

  useEffect(() => {
    return () => {
      pipWindow?.close();
    };
  }, [pipWindow]);

  if (!isActive || pathname.startsWith("/pomodoro")) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 border-2 border-black bg-white px-3 py-2 shadow-lg">
      <span className="font-mono text-lg">
        {minutes}:{seconds}
      </span>
      {typeof window !== "undefined" &&
        "documentPictureInPicture" in window && (
          <Button size="icon" variant="outline" onClick={openPiP}>
            <PiPIcon className="h-4 w-4" />
          </Button>
        )}
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

