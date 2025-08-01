import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Star } from "lucide-react";
import type { LeaderboardEntry, User } from "@shared/schema";

// Mock current user
const MOCK_USER: User = {
  id: "current-user",
  farcasterUsername: "alice.eth",
  farcasterUserId: "1",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  points: 247,
  totalGamesCreated: 8,
  totalGamesPlayed: 23,
  totalCorrectGuesses: 18,
  totalPlayersStumped: 12,
  currentStreak: 5,
  createdAt: new Date(),
};

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', { timeframe, limit: 50 }],
    queryFn: async () => {
      const params = new URLSearchParams({
        timeframe,
        limit: '50',
      });
      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const leaderboard: LeaderboardEntry[] = leaderboardData?.leaderboard || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-500" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-400 to-gray-600";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600";
    return "bg-farcaster";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader user={MOCK_USER} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-600 mt-1">See who's leading the truth detection game</p>
          </div>
          
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'weekly' | 'all-time')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Second Place */}
                <div className="text-center order-1">
                  <div className="relative">
                    <img 
                      src={leaderboard[1].user.avatar || '/default-avatar.png'} 
                      alt="Second Place" 
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-gray-400"
                    />
                    <div className="absolute -top-2 -right-2">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">@{leaderboard[1].user.farcasterUsername}</h3>
                  <p className="text-2xl font-bold text-gray-600">{leaderboard[1].weeklyPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>

                {/* First Place */}
                <div className="text-center order-2">
                  <div className="relative">
                    <img 
                      src={leaderboard[0].user.avatar || '/default-avatar.png'} 
                      alt="First Place" 
                      className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-yellow-400"
                    />
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="h-10 w-10 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">@{leaderboard[0].user.farcasterUsername}</h3>
                  <p className="text-3xl font-bold text-yellow-600">{leaderboard[0].weeklyPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>

                {/* Third Place */}
                <div className="text-center order-3">
                  <div className="relative">
                    <img 
                      src={leaderboard[2].user.avatar || '/default-avatar.png'} 
                      alt="Third Place" 
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-orange-400"
                    />
                    <div className="absolute -top-2 -right-2">
                      <Award className="h-8 w-8 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">@{leaderboard[2].user.farcasterUsername}</h3>
                  <p className="text-2xl font-bold text-orange-600">{leaderboard[2].weeklyPoints}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>{timeframe === 'weekly' ? 'Weekly' : 'All-Time'} Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.user.id === MOCK_USER.id;
                  return (
                    <div 
                      key={entry.user.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isCurrentUser 
                          ? 'bg-farcaster/10 border border-farcaster/30' 
                          : entry.rank <= 3 
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
                            : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${getRankBadgeColor(entry.rank)}`}>
                          {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                        </div>
                        <img 
                          src={entry.user.avatar || '/default-avatar.png'} 
                          alt={`${entry.user.farcasterUsername} avatar`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className={`font-semibold ${isCurrentUser ? 'text-farcaster' : 'text-gray-900'}`}>
                            @{entry.user.farcasterUsername}
                            {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{entry.user.totalGamesPlayed} games</span>
                            <span>{entry.user.totalCorrectGuesses} correct</span>
                            <span>{entry.user.totalPlayersStumped} stumped</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isCurrentUser ? 'text-farcaster' : 'text-gray-900'}`}>
                          {entry.weeklyPoints}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No leaderboard data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
