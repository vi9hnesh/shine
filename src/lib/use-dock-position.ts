"use client";

import { useState, useEffect } from "react";

// Keep this type local to avoid circular imports with the Dock component
export type DockPosition = "bottom" | "left" | "right";

const DOCK_POSITION_KEY = "shine-dock-position";

export function useDockPosition() {
  const [position, setPosition] = useState<DockPosition>("bottom");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readAndSet = () => {
      try {
        const savedPosition = localStorage.getItem(DOCK_POSITION_KEY) as DockPosition | null;
        if (savedPosition && ["bottom", "left", "right"].includes(savedPosition)) {
          setPosition(savedPosition);
        }
      } catch {}
      setMounted(true);
    };

    readAndSet();

    const onStorage = (_e: StorageEvent) => {
      if (!_e.key || _e.key === DOCK_POSITION_KEY) {
        readAndSet();
      }
    };
    const onCustom = (e: Event) => {
      readAndSet();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("shine:dock-position", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("shine:dock-position", onCustom);
    };
  }, []);

  const updatePosition = (newPosition: DockPosition) => {
    setPosition(newPosition);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DOCK_POSITION_KEY, newPosition);
      } catch {}
      window.dispatchEvent(new Event("shine:dock-position"));
    }
  };

  const cyclePosition = () => {
    const positions: DockPosition[] = ["bottom", "left", "right"];
    const currentIndex = positions.indexOf(position);
    const nextIndex = (currentIndex + 1) % positions.length;
    updatePosition(positions[nextIndex]);
  };

  return {
    position,
    updatePosition,
    cyclePosition,
    mounted
  };
}
