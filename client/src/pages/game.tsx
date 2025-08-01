import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import NavigationHeader from "@/components/navigation-header";
import VotingInterface from "@/components/voting-interface";
import FarcasterShare from "@/components/farcaster-share";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share, Flag } from "lucide-react";
import { Link } from "wouter";
import type { GameWithCreator, User } from "@shared/schema";

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

export default function Game() {
  const { id } = useParams();

  const { data: gameData, isLoading, error } = useQuery({
    queryKey: ['/api/games', id, { userId: MOCK_USER.id }],
    queryFn: async () => {
      const response = await fetch(`/api/games/${id}?userId=${MOCK_USER.id}`);
      if (!response.ok) throw new Error('Failed to fetch game');
      return response.json();
    },
    enabled: !!id,
  });

  const game: GameWithCreator | undefined = gameData?.game;

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavigationHeader user={MOCK_USER} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <NavigationHeader user={MOCK_USER} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-red-500 mb-4">Game not found or failed to load.</p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationHeader user={MOCK_USER} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Flag className="mr-2 h-4 w-4" />
              Report
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Game Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={game.creator.avatar || '/default-avatar.png'} 
                  alt="Creator Avatar" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">@{game.creator.farcasterUsername}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={game.isActive ? "default" : "secondary"}>
                  {game.isActive ? "Active" : "Completed"}
                </Badge>
                <span className="text-sm text-gray-500">{game.voteCount} votes</span>
              </div>
            </div>

            <VotingInterface 
              game={game} 
              currentUserId={MOCK_USER.id}
            />

            {game.explanation && !game.isActive && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">@{game.creator.farcasterUsername}'s explanation:</span>{' '}
                  {game.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farcaster Share Section */}
        {!game.isActive && game.hasVoted && (
          <div className="mb-6">
            <FarcasterShare 
              game={game as any}
              userScore={game.userVote ? {
                correct: game.userVote.isCorrect,
                selectedStatement: game.userVote.selectedStatement
              } : undefined}
            />
          </div>
        )}

        {/* Game Stats */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Game Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{game.voteCount}</div>
                <div className="text-sm text-gray-500">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {game.isActive ? game.timeRemaining : 'Completed'}
                </div>
                <div className="text-sm text-gray-500">Time Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {game.creator.totalPlayersStumped}
                </div>
                <div className="text-sm text-gray-500">Players Stumped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
