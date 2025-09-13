"use client";

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Home } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function ProtectedLayout({ 
  children, 
  title = "Shine App", 
  description = "Focus and productivity workspace" 
}: ProtectedLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-gray-900">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  // If no user after loading, this shouldn't happen due to ensureSignedIn
  // but we handle it gracefully
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-2 border-gray-900 text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this area.</p>
          <Button onClick={() => router.push('/sign-in')}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b-2 border-gray-900 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
                className="border border-gray-300 hover:bg-gray-100"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">
                Welcome, {user.firstName || user.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/profile')}
                className="border border-gray-300 hover:bg-gray-100"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
