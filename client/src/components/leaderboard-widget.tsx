import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardWidgetProps {
  currentUserId: string;
}

export default function LeaderboardWidget({ currentUserId }: LeaderboardWidgetProps) {
  const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', { timeframe, limit: 10 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe,
        limit: '10',
      });
      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const leaderboard: LeaderboardEntry[] = leaderboardData?.leaderboard || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return rank;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-600";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600";
    return "bg-farcaster";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold">🏆 Farcaster Leaders</CardTitle>
        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'weekly' | 'all-time')}>
          <SelectTrigger className="w-[120px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.slice(0, 4).map((entry) => {
              const isCurrentUser = entry.user.id === currentUserId;
              return (
                <div 
                  key={entry.user.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-farcaster/10 border border-farcaster/30' 
                      : entry.rank <= 3 
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
                        : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${getRankBadgeColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    <img 
                      src={entry.user.avatar || '/default-avatar.png'} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className={`font-semibold text-sm ${isCurrentUser ? 'text-farcaster' : 'text-gray-900'}`}>
                      {isCurrentUser ? 'You' : `@${entry.user.farcasterUsername}`}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${isCurrentUser ? 'text-farcaster' : 'text-gray-600'}`}>
                    {entry.weeklyPoints} pts
                  </span>
                </div>
              );
            })}
            
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="w-full mt-4 text-farcaster hover:bg-purple-50">
                View Full Leaderboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No leaderboard data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
