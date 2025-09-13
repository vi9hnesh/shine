"use client";

import { ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dock } from "@/components/ui/dock";
import { useDockPosition } from "@/lib/use-dock-position";
import {
  Keyboard,
  Timer,
  PenTool,
  FileText,
  Home,
  Newspaper,
  Heart
} from "lucide-react";

interface ShineLayoutProps {
  children: ReactNode;
  enableDockDragging?: boolean;
}

const dockItems = [
  {
    icon: Home,
    label: "Shine Home",
    path: "/"
  },
  {
    icon: Keyboard,
    label: "Flow",
    path: "/typing"
  },
  {
    icon: PenTool,
    label: "Reflect",
    path: "/journal"
  },
  {
    icon: Timer,
    label: "Pomodoro",
    path: "/pomodoro"
  },
  {
    icon: FileText,
    label: "Reads",
    path: "/reads"
  },
  {
    icon: Newspaper,
    label: "Newsletter",
    path: "/newsletter"
  },
  {
    icon: Heart,
    label: "Appreciate",
    path: "/appreciate"
  }
];

export default function ShineLayout({ 
  children,
  enableDockDragging = true
}: ShineLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { position: dockPosition, updatePosition, mounted: dockMounted } = useDockPosition();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      // Immediate mounting for faster navigation
      setMounted(true);
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(timer);
    }, []);

    const handleDockItemClick = useCallback((path: string) => {
      // Optimistic navigation - start transition immediately
      router.push(path);
    }, [router]);

    const dockItemsWithState = useMemo(
      () =>
        dockItems.map((item) => ({
          ...item,
          isActive: pathname === item.path,
          onClick: () => handleDockItemClick(item.path),
        })),
      [pathname, handleDockItemClick]
    );

    if (!mounted || !dockMounted) {
      return (
        <div className="h-full bg-white font-syne overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <div className="border-2 border-black px-3 py-1 bg-black text-white text-sm font-bold tracking-wider">
              LOADING...
            </div>
          </div>
        </div>
      );
    }

  const getContentPadding = () => {
    switch (dockPosition) {
      case 'left':
        return "pl-16 sm:pl-20" // Add left padding for left dock (64px mobile, 80px desktop)
      case 'right':
        return "pr-16 sm:pr-20" // Add right padding for right dock (64px mobile, 80px desktop)
      default:
        return "" // No additional padding for bottom dock
    }
  }

  return (
    <div className="h-full bg-white font-syne overflow-hidden relative">
      {/* Main Content */}
      <div className={`h-full overflow-hidden max-w-full sm:max-w-[98%] md:max-w-[96%] lg:max-w-[94%] xl:max-w-[94%] 4xl:max-w-[90%] mx-auto ${getContentPadding()}`}>
        {children}
      </div>

      {/* Dock Navigation */}
      <Dock
        items={dockItemsWithState}
        showLabels={false}
        currentTime={currentTime}
        position={dockPosition}
        onPositionChange={updatePosition}
        isDraggable={enableDockDragging}
      />
    </div>
  );
} 