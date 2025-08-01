import { useState, useEffect } from 'react';
import type { User } from '@shared/schema';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored Farcaster auth session
    const storedAuth = localStorage.getItem('farcaster_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Check if auth session is still valid (24 hours)
        const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired && authData.user) {
          setUser(authData.user);
        } else {
          // Clean up expired session
          localStorage.removeItem('farcaster_auth');
          localStorage.removeItem('farcaster_user');
        }
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        localStorage.removeItem('farcaster_auth');
        localStorage.removeItem('farcaster_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('farcaster_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('farcaster_user');
    localStorage.removeItem('farcaster_auth');
    // Force page reload to clear any cached Farcaster auth state
    window.location.reload();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}