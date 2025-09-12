"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dock } from "@/components/ui/dock";
import { 
  Keyboard, 
  Timer, 
  PenTool, 
  FileText, 
  Home
} from "lucide-react";

interface ShineLayoutProps {
  children: ReactNode;
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
  }
];

export default function ShineLayout({ 
  children
}: ShineLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      setMounted(true);
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(timer);
    }, []);

    const handleDockItemClick = (path: string) => {
      router.push(path);
    };

    const dockItemsWithState = useMemo(
      () =>
        dockItems.map((item) => ({
          ...item,
          isActive: pathname === item.path,
          onClick: () => handleDockItemClick(item.path),
        })),
      [pathname]
    );

    if (!mounted) {
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

  return (
    <div className="h-full bg-white font-syne overflow-hidden relative">
      {/* Main Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>

      {/* Dock Navigation */}
      <Dock 
        items={dockItemsWithState}
        showLabels={false}
        currentTime={currentTime}
      />
    </div>
  );
} 