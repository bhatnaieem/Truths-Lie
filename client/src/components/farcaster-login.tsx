import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, LogIn } from "lucide-react";

interface FarcasterLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function FarcasterLogin({ onLoginSuccess }: FarcasterLoginProps) {
  const [farcasterUsername, setFarcasterUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (userData: { farcasterUsername: string; farcasterUserId: string; avatar?: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
    onSuccess: (data) => {
      onLoginSuccess(data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleConnect = async () => {
    if (!farcasterUsername.trim()) return;
    
    setIsConnecting(true);
    
    // Simulate Farcaster connection - in real implementation this would use Farcaster SDK
    const mockUserData = {
      farcasterUsername: farcasterUsername.trim(),
      farcasterUserId: Math.random().toString(36).substring(7),
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
    };
    
    try {
      await loginMutation.mutateAsync(mockUserData);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWarpcastConnect = () => {
    // Deep link to Warpcast for real Farcaster authentication
    window.open('https://warpcast.com/', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎭</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Truth Lie</CardTitle>
          <CardDescription>
            Connect with Farcaster to start playing the ultimate social guessing game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Farcaster Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Farcaster username"
              value={farcasterUsername}
              onChange={(e) => setFarcasterUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>
          
          <Button 
            onClick={handleConnect}
            disabled={!farcasterUsername.trim() || isConnecting || loginMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isConnecting || loginMutation.isPending ? 'Connecting...' : 'Connect & Play'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleWarpcastConnect}
            className="w-full border-purple-200 hover:bg-purple-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Warpcast
          </Button>

          <div className="text-center text-sm text-gray-600">
            <p>Built natively for the Farcaster ecosystem</p>
            <p className="mt-1">Created by <span className="text-purple-600 font-medium">@deathnotes.eth</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}