"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { 
  SignInButton, 
  SignedIn, 
  SignedOut
} from '@clerk/nextjs';
import UserBubble from "@/components/auth/user-bubble";

/**
 * Global top bar rendered on every page.
 * Visibility is controlled by localStorage key `shine.topBarHidden`.
 * The top bar is always shown on the homepage (`/`).
 */
export default function TopBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hidden, setHidden] = useState(false);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Read visibility from localStorage and subscribe to changes
  useEffect(() => {
    const read = () => {
      try {
        const v = localStorage.getItem("shine.topBarHidden");
        setHidden(v === "true");
      } catch {
        setHidden(false);
      }
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "shine.topBarHidden") read();
    };
    const onCustom = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("shine:topbar", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("shine:topbar", onCustom as EventListener);
    };
  }, []);

  const show = useMemo(() => (isHome ? true : !hidden), [isHome, hidden]);

  if (!show) return null;

  return (
    <div className="sticky top-0 z-50  border-gray-900 bg-white shadow">
      <div className="w-full">
        {/* Simple newspaper-style header without animations */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-300">
          <div className="flex items-center justify-between px-6 py-2">
            <div className="text-xl font-bold tracking-wider text-gray-900 font-serif">
              THE SHINE
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Clock className="w-3 h-3" />
                <span className="font-medium">{formatTime(currentTime)}</span>
              </div>

              {/* Authentication UI */}
              <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="border border-gray-300 hover:bg-gray-100 text-xs h-6 px-2 rounded text-gray-700 font-medium transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserBubble />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
