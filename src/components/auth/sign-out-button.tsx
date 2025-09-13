"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SignOutCTA() {
  return (
    <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
      <Button 
        variant="outline"
        className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </SignOutButton>
  );
}

