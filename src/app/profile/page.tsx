import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar } from "lucide-react";
import SignOutCTA from "@/components/auth/sign-out-button";

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const firstName = user.firstName || null;
  const lastName = user.lastName || null;
  const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || 'Not provided';
  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Card className="border-2 border-gray-900 shadow-lg">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 border-2 border-gray-900 bg-gray-900">
                <User className="w-5 h-5 text-white" />
              </div>
              Account Information
            </CardTitle>
            <CardDescription>
              Your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </label>
                <div className="p-3 border border-gray-300 rounded bg-gray-50">{firstName || 'Not provided'}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </label>
                <div className="p-3 border border-gray-300 rounded bg-gray-50">{lastName || 'Not provided'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="p-3 border border-gray-300 rounded bg-gray-50">{email}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Account Created
              </label>
              <div className="p-3 border border-gray-300 rounded bg-gray-50">
                {createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <SignOutCTA />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
