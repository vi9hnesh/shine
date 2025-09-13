"use client";

import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Settings, 
  Globe,
  Key,
  Shield,
  ExternalLink
} from "lucide-react";
import { useRouter } from 'next/navigation';

export default function AuthDebugPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const envVars = {
    clientId: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID || 'Not set',
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'Not set',
    hasApiKey: !!process.env.WORKOS_API_KEY,
    hasCookiePassword: !!process.env.WORKOS_COOKIE_PASSWORD,
  };

  const configChecks = [
    {
      name: "Client ID",
      status: envVars.clientId !== 'Not set' ? 'success' : 'error',
      value: envVars.clientId,
      icon: Key
    },
    {
      name: "Redirect URI", 
      status: envVars.redirectUri !== 'Not set' ? 'success' : 'error',
      value: envVars.redirectUri,
      icon: Globe
    },
    {
      name: "API Key",
      status: envVars.hasApiKey ? 'success' : 'error', 
      value: envVars.hasApiKey ? 'Set (hidden for security)' : 'Not set',
      icon: Shield
    },
    {
      name: "Cookie Password",
      status: envVars.hasCookiePassword ? 'success' : 'error',
      value: envVars.hasCookiePassword ? 'Set (hidden for security)' : 'Not set', 
      icon: Settings
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default: return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Debug</h1>
          <p className="text-gray-600">Diagnostic information for WorkOS AuthKit integration</p>
        </div>

        {/* Authentication Status */}
        <Card className="border-2 border-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-6 h-6" />
              Authentication Status
            </CardTitle>
            <CardDescription>Current user authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>Checking authentication...</span>
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Authenticated</Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded border">
                  <h4 className="font-semibold mb-2">User Information:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>First Name:</strong> {user.firstName || 'Not provided'}</p>
                    <p><strong>Last Name:</strong> {user.lastName || 'Not provided'}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">Not Authenticated</Badge>
                </div>
                <Button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700">
                  Test Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card className="border-2 border-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              Configuration Status
            </CardTitle>
            <CardDescription>Environment variables and configuration checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {configChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-3">
                    <check.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-gray-600">{check.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    {getStatusBadge(check.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-2 border-gray-900">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Test different authentication flows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Test Login</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/profile')}
                className="h-auto p-4 flex flex-col items-center gap-2"
                disabled={!user}
              >
                <User className="w-5 h-5" />
                <span>View Profile</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/typing')}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Shield className="w-5 h-5" />
                <span>Test Protected Route</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <AlertCircle className="w-6 h-6" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-800">
            <div className="space-y-2 text-sm">
              <p><strong>Experiencing CORS errors?</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Check WorkOS Dashboard redirect URIs configuration</li>
                <li>Ensure <code>http://localhost:3000/callback</code> is added</li>
                <li>Verify login endpoint is set to <code>http://localhost:3000/login</code></li>
                <li>Clear browser cache and cookies</li>
                <li>Make sure you're in the Test environment in WorkOS</li>
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/')}
                  className="border-amber-600 text-amber-800 hover:bg-amber-100"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
