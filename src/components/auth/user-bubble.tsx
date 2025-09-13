"use client";

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Settings, LogOut, Eye, EyeOff, PanelBottom, PanelLeft, PanelRight } from "lucide-react";
import type { DockPosition } from "@/lib/use-dock-position";
import { useRouter } from 'next/navigation';

interface UserBubbleProps {
  className?: string;
}

export default function UserBubble({ className = "" }: UserBubbleProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [topBarHidden, setTopBarHidden] = useState(false);
  const [dockPosition, setDockPosition] = useState<DockPosition>("bottom");
  const router = useRouter();

  // Top bar visibility state from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem('shine.topBarHidden');
      setTopBarHidden(v === 'true');
    } catch {}
    try {
      const p = localStorage.getItem('shine-dock-position') as DockPosition | null;
      if (p === 'left' || p === 'right' || p === 'bottom') setDockPosition(p);
    } catch {}
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'shine.topBarHidden' || e.key === 'shine-dock-position') {
        try {
          const v = localStorage.getItem('shine.topBarHidden');
          setTopBarHidden(v === 'true');
        } catch {}
        try {
          const p = localStorage.getItem('shine-dock-position') as DockPosition | null;
          if (p === 'left' || p === 'right' || p === 'bottom') setDockPosition(p);
        } catch {}
      }
    };
    const onCustom = () => {
      try {
        const v = localStorage.getItem('shine.topBarHidden');
        setTopBarHidden(v === 'true');
      } catch {}
      try {
        const p = localStorage.getItem('shine-dock-position') as DockPosition | null;
        if (p === 'left' || p === 'right' || p === 'bottom') setDockPosition(p);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('shine:topbar', onCustom as EventListener);
    window.addEventListener('shine:dock-position', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('shine:topbar', onCustom as EventListener);
      window.removeEventListener('shine:dock-position', onCustom as EventListener);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  // Get user initials
  const getInitials = (u: { firstName?: string | null; lastName?: string | null; email?: string | null }) => {
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    if (u.firstName) {
      return u.firstName[0].toUpperCase();
    }
    if (u.email) {
      return u.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = (u: { firstName?: string | null; lastName?: string | null; email?: string | null }) => {
    if (u.firstName && u.lastName) {
      return `${u.firstName} ${u.lastName}`;
    }
    if (u.firstName) {
      return u.firstName;
    }
    return u.email || 'User';
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 bg-white px-3 py-1 h-8"
      >
        {/* User Avatar */}
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {getInitials({ firstName: user.firstName, lastName: user.lastName, email: user.primaryEmailAddress?.emailAddress || null })}
        </div>
        
        {/* User Name */}
        <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
          {user.firstName || user.primaryEmailAddress?.emailAddress || 'User'}
        </span>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <Card className="absolute top-full right-0 mt-2 w-64 border-2 border-gray-900 shadow-lg z-20 bg-white p-0">
            <div className="p-4">
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials({ firstName: user.firstName, lastName: user.lastName, email: user.primaryEmailAddress?.emailAddress || null })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {getDisplayName({ firstName: user.firstName, lastName: user.lastName, email: user.primaryEmailAddress?.emailAddress || null })}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 space-y-1">                
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push('/profile');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start text-left h-8 px-2 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Profile & Settings
                </Button>

                {/* Dock Position */}
                <div className="px-2 pt-1">
                  <div className="text-[11px] font-semibold text-gray-500 tracking-wider mb-1">DOCK POSITION</div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        try { localStorage.setItem('shine-dock-position', 'left'); } catch {}
                        setDockPosition('left');
                        window.dispatchEvent(new Event('shine:dock-position'));
                      }}
                      className={`h-8 px-2 flex-1 justify-center ${dockPosition === 'left' ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100'}`}
                      title="Left"
                    >
                      <PanelLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        try { localStorage.setItem('shine-dock-position', 'bottom'); } catch {}
                        setDockPosition('bottom');
                        window.dispatchEvent(new Event('shine:dock-position'));
                      }}
                      className={`h-8 px-2 flex-1 justify-center ${dockPosition === 'bottom' ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100'}`}
                      title="Bottom"
                    >
                      <PanelBottom className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        try { localStorage.setItem('shine-dock-position', 'right'); } catch {}
                        setDockPosition('right');
                        window.dispatchEvent(new Event('shine:dock-position'));
                      }}
                      className={`h-8 px-2 flex-1 justify-center ${dockPosition === 'right' ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white' : 'hover:bg-gray-100'}`}
                      title="Right"
                    >
                      <PanelRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Toggle Top Bar Visibility */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    const next = !topBarHidden;
                    try {
                      localStorage.setItem('shine.topBarHidden', String(next));
                    } catch {}
                    setTopBarHidden(next);
                    // Notify listeners (TopBar) in this tab
                    window.dispatchEvent(new Event('shine:topbar'));
                  }}
                  className="w-full justify-start text-left h-8 px-2 hover:bg-gray-100"
                >
                  {topBarHidden ? (
                    <Eye className="w-4 h-4 mr-3" />
                  ) : (
                    <EyeOff className="w-4 h-4 mr-3" />
                  )}
                  {topBarHidden ? 'Show Top Bar' : 'Hide Top Bar'}
                </Button>
              </div>

              {/* Sign Out */}
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setIsOpen(false);
                    await signOut({ redirectUrl: '/' });
                  }}
                  className="w-full justify-start text-left h-8 px-2 hover:bg-red-50 text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
