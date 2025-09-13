import { withAuth } from '@workos-inc/authkit-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, LogOut } from "lucide-react";

export default async function ProfilePage() {
  // Ensure user is signed in, redirect to AuthKit if not
  const { user } = await withAuth({ ensureSignedIn: true });

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
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                  {user.firstName || 'Not provided'}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Last Name
                </label>
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                  {user.lastName || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="p-3 border border-gray-300 rounded bg-gray-50">
                {user.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Account Created
              </label>
              <div className="p-3 border border-gray-300 rounded bg-gray-50">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <a href="/logout">
                <Button 
                  variant="outline"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
