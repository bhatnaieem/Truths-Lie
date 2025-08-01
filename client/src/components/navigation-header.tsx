import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Star, VenetianMask, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface NavigationHeaderProps {
  user: User;
}

export default function NavigationHeader({ user }: NavigationHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80">
            <div className="bg-farcaster p-1.5 rounded-lg">
              <VenetianMask className="text-white h-4 w-4" />
            </div>
            <h1 className="text-sm font-bold text-gray-900">🎭 Truth Lie</h1>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* User Points Display */}
            <Badge variant="secondary" className="bg-purple-500 text-white hover:bg-purple-600">
              <Star className="mr-1 h-3 w-3 fill-current" />
              <span className="font-medium">{user.points} pts</span>
            </Badge>
            
            {/* User Profile */}
            <div className="flex items-center space-x-1">
              <img 
                src={user.avatar || '/default-avatar.png'} 
                alt="User Avatar" 
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-farcaster hidden sm:inline">@{user.farcasterUsername}</span>
            </div>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('No new notifications');
              }}
            >
              <Bell className="h-4 w-4 text-gray-600" />
            </Button>

            {/* Logout */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }} 
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
