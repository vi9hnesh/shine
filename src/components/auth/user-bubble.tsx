"use client";

import { useState } from 'react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, ChevronDown, Settings, LogOut, Home } from "lucide-react";
import { useRouter } from 'next/navigation';

interface UserBubbleProps {
  className?: string;
}

export default function UserBubble({ className = "" }: UserBubbleProps) {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials
  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email;
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
          {getInitials(user)}
        </div>
        
        {/* User Name */}
        <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
          {user.firstName || 'User'}
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
          <Card className="absolute top-full right-0 mt-2 w-64 border-2 border-gray-900 shadow-lg z-20 bg-white">
            <div className="p-4">
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(user)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {getDisplayName(user)}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => {
                    router.push('/');
                    setIsOpen(false);
                  }}
                  className="w-full justify-start text-left h-8 px-2 hover:bg-gray-100"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Home
                </Button>
                
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
              </div>

              {/* Sign Out */}
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/logout';
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
