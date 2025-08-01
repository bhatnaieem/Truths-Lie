import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Star, VenetianMask } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

interface NavigationHeaderProps {
  user: User;
}

export default function NavigationHeader({ user }: NavigationHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80">
            <div className="bg-farcaster p-1.5 rounded-lg">
              <VenetianMask className="text-white h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">🎭 Truth Lie</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* User Points Display */}
            <Badge variant="secondary" className="bg-gradient-to-r from-farcaster to-farcaster-dark text-white hover:opacity-90">
              <Star className="mr-1 h-3 w-3" />
              <span>{user.points} pts</span>
            </Badge>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt="User Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-farcaster">@{user.farcasterUsername}</span>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
