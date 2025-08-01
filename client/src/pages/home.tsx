import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import CreateGameForm from "@/components/create-game-form";
import GameCard from "@/components/game-card";
import LeaderboardWidget from "@/components/leaderboard-widget";
import ActivityFeed from "@/components/activity-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Trophy, Star, Clock, Home as HomeIcon, RefreshCw, User as UserIcon, ExternalLink } from "lucide-react";
import type { GameWithCreator, User } from "@shared/schema";

// Mock current user - in a real app this would come from Farcaster auth
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

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [gameFilter, setGameFilter] = useState<'all' | 'friends' | 'new'>('all');

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/games', { userId: MOCK_USER.id, friendsOnly: gameFilter === 'friends' }],
    queryFn: async () => {
      const params = new URLSearchParams({
        userId: MOCK_USER.id,
        limit: '10',
        friendsOnly: gameFilter === 'friends' ? 'true' : 'false',
      });
      const response = await fetch(`/api/games?${params}`);
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['/api/users', MOCK_USER.id, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${MOCK_USER.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const games: GameWithCreator[] = gamesData?.games || [];
  const stats = statsData?.stats || {
    gamesPlayed: MOCK_USER.totalGamesPlayed,
    correctGuesses: MOCK_USER.totalCorrectGuesses,
    stumpedPlayers: MOCK_USER.totalPlayersStumped,
    streak: MOCK_USER.currentStreak,
    points: MOCK_USER.points,
    rank: 12,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader user={MOCK_USER} />
      
      {/* Welcome Instructions */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">🎭 Welcome to Truth Lie!</h2>
          <p className="text-purple-100 mb-3">
            The social guessing game built for Farcaster. Challenge your friends and test your intuition!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span>
              <span>Read three statements</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span>
              <span>Spot the one lie</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span>
              <span>Share on Farcaster</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Statistics Banner */}
        <Card className="bg-gradient-to-r from-farcaster to-farcaster-dark text-white mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
                <div className="text-purple-200 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.correctGuesses}</div>
                <div className="text-purple-200 text-sm">Correct Guesses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.stumpedPlayers}</div>
                <div className="text-purple-200 text-sm">Players Stumped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.streak}</div>
                <div className="text-purple-200 text-sm">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            className="bg-farcaster hover:bg-farcaster-dark flex-1"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Game
          </Button>
          <Button variant="outline" className="flex-1">
            <Play className="mr-2 h-4 w-4" />
            Play Games
          </Button>
          <Button variant="outline" className="flex-1">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Active Games */}
          <div className="lg:col-span-2">
            {/* Create Game Form */}
            {showCreateForm && (
              <div className="mb-8 animate-slide-up">
                <CreateGameForm 
                  userId={MOCK_USER.id}
                  onClose={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {/* Active Games Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Active Games</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={gameFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setGameFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={gameFilter === 'friends' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setGameFilter('friends')}
                  >
                    Friends
                  </Button>
                  <Button
                    variant={gameFilter === 'new' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setGameFilter('new')}
                  >
                    New
                  </Button>
                </div>
              </div>

              {gamesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="pt-6">
                        <div className="h-32 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : games.length > 0 ? (
                <div className="space-y-6">
                  {games.map((game) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      currentUserId={MOCK_USER.id}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-500">No active games found.</p>
                    <Button 
                      className="mt-4"
                      onClick={() => setShowCreateForm(true)}
                    >
                      Create the first game
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column: Leaderboard & Quick Stats */}
          <div className="space-y-6">
            <LeaderboardWidget currentUserId={MOCK_USER.id} />
            <ActivityFeed />
            
            {/* Daily Challenge */}
            <Card className="bg-gradient-to-br from-farcaster to-farcaster-dark text-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Daily Challenge</h3>
                  <Trophy className="h-6 w-6 text-yellow-300" />
                </div>
                
                <div className="space-y-3">
                  <p className="text-purple-100 text-sm">Complete today's challenge for bonus points!</p>
                  
                  <div className="bg-white/20 rounded-lg p-3">
                    <h4 className="font-semibold mb-1">Stump 5 Players</h4>
                    <p className="text-sm text-purple-200">Create a game that stumps at least 5 different players</p>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>3/5</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div className="bg-yellow-300 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">Reward: +50 bonus points</span>
                    <span className="text-purple-200 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      23h 45m left
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-1 px-3"
              onClick={() => window.location.href = '/'}
            >
              <HomeIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-1 px-3"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Create</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-1 px-3"
              onClick={() => window.location.href = '/leaderboard'}
            >
              <Trophy className="h-5 w-5 mb-1" />
              <span className="text-xs">Leaderboard</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-1 px-3"
              onClick={() => setShowAbout(!showAbout)}
            >
              <UserIcon className="h-5 w-5 mb-1" />
              <span className="text-xs">About</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">About Truth Lie</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAbout(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                🎯 Truth Lie is a social guessing game built <strong>natively for Farcaster</strong> where players create engaging 
                three-statement challenges and the community votes to detect the lie. Share your results and challenge your Farcaster friends!
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">How it works:</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Create games with 2 truths and 1 lie</li>
                  <li>• Vote on other players' games</li>
                  <li>• Earn points for correct guesses</li>
                  <li>• Share results on Farcaster</li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-gray-600 text-sm mb-3">
                  🚀 Created by <strong>@deathnotes.eth</strong> - Follow me on Farcaster for updates and new features!
                </p>
                <Button 
                  className="w-full bg-farcaster hover:bg-farcaster-dark text-white"
                  onClick={() => window.open('https://farcaster.xyz/deathnotes.eth', '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Follow @deathnotes.eth on Farcaster
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Built natively for the Farcaster ecosystem 🟣
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
