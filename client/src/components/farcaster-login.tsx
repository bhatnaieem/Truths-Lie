import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider, SignInButton, useProfile } from "@farcaster/auth-kit";

interface FarcasterLoginProps {
  onLoginSuccess: (user: any) => void;
}

const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: typeof window !== 'undefined' ? window.location.hostname : "localhost",
  siweUri: typeof window !== 'undefined' ? window.location.origin : "http://localhost:5000",
};

function FarcasterAuthComponent({ onLoginSuccess }: FarcasterLoginProps) {
  const { 
    isAuthenticated, 
    profile, 
  } = useProfile();

  // Auto-login when Farcaster authentication succeeds
  useEffect(() => {
    if (isAuthenticated && profile) {
      const userData = {
        farcasterUsername: profile.username,
        farcasterUserId: profile.fid?.toString() || '',
        avatar: profile.pfpUrl,
      };
      
      // Call backend to create/login user
      fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' },
      })
      .then(res => res.json())
      .then(data => {
        // Store Farcaster auth state in localStorage for persistence
        localStorage.setItem('farcaster_auth', JSON.stringify({
          isAuthenticated: true,
          profile: profile,
          user: data.user,
          timestamp: Date.now()
        }));
        onLoginSuccess(data.user);
      })
      .catch(error => console.error('Login failed:', error));
    }
  }, [isAuthenticated, profile, onLoginSuccess]);

  return null; // This component handles auth logic silently
}

export default function FarcasterLogin({ onLoginSuccess }: FarcasterLoginProps) {

  return (
    <AuthKitProvider config={config}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <FarcasterAuthComponent onLoginSuccess={onLoginSuccess} />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <CardTitle className="text-xl">Welcome to Truth Lie</CardTitle>
            <CardDescription className="text-sm">
              Connect with Farcaster to start playing the ultimate social guessing game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-xl text-white">🔗</span>
                </div>
                <p className="text-sm text-purple-800 font-medium mb-2">
                  Connect Your Farcaster Account
                </p>
                <p className="text-xs text-purple-600">
                  Sign in with your Farcaster account to start playing Truth Lie and challenge your friends.
                </p>
              </div>
            </div>

            <SignInButton>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Sign In with Farcaster
              </Button>
            </SignInButton>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p className="text-xs text-gray-500">
                By connecting, you agree to our terms of service
              </p>
              <div className="flex items-center justify-center space-x-1 text-xs">
                <span>Built natively for</span>
                <span className="font-medium text-purple-600">Farcaster</span>
              </div>
              <p className="text-xs">
                Created by <span className="text-purple-600 font-medium">@deathnotes.eth</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthKitProvider>
  );
}