import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Flag, Share, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";
import FarcasterShare from "@/components/farcaster-share";
import type { GameWithCreator } from "@shared/schema";

interface GameCardProps {
  game: GameWithCreator;
  currentUserId: string;
}

export default function GameCard({ game, currentUserId }: GameCardProps) {
  const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
  const [showFarcasterShare, setShowFarcasterShare] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (statementNumber: number) => {
      const response = await fetch(`/api/games/${game.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: currentUserId,
          selectedStatement: statementNumber,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote submitted!",
        description: "Your vote has been recorded. Check back later for results.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (statementNumber: number) => {
    if (game.hasVoted) return;
    
    setSelectedStatement(statementNumber);
    voteMutation.mutate(statementNumber);
  };

  const statements = Array.isArray(game.statements) ? game.statements : [];

  const getStatementStyle = (index: number) => {
    const statementNumber = index + 1;
    
    if (game.hasVoted && game.userVote) {
      if (game.userVote.selectedStatement === statementNumber) {
        return "border-farcaster bg-purple-50";
      }
      return "border-gray-200 opacity-75";
    }
    
    if (selectedStatement === statementNumber) {
      return "border-farcaster bg-purple-50";
    }
    
    return "border-gray-200 hover:border-farcaster hover:bg-purple-50 cursor-pointer";
  };

  const getVoteIndicator = (index: number) => {
    const statementNumber = index + 1;
    
    if (game.hasVoted && game.userVote?.selectedStatement === statementNumber) {
      return (
        <div className="w-6 h-6 bg-farcaster border-2 border-farcaster rounded-full flex items-center justify-center">
          <CheckCircle className="text-white h-3 w-3" />
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-gray-400">{statementNumber}</span>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
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
              {game.hasVoted ? "You Voted" : game.isActive ? "Active" : "Completed"}
            </Badge>
            <span className="text-sm text-gray-500">{game.voteCount} votes</span>
          </div>
        </div>
        
        {/* Game Instructions */}
        {!game.hasVoted && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                <span className="text-purple-600 font-semibold text-sm">?</span>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">How to Play</h4>
                <p className="text-purple-700 text-sm mt-1">
                  Read the three statements below. <strong>One is a lie</strong> - click on the statement you think is false!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3 mb-6">
          {statements.map((statement, index) => (
            <div 
              key={index}
              className={`p-4 border-2 rounded-xl transition-all ${getStatementStyle(index)}`}
              onClick={() => !game.hasVoted && handleVote(index + 1)}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-900 flex-1 pr-4">{statement}</p>
                {getVoteIndicator(index)}
              </div>
            </div>
          ))}
        </div>
        
        {game.hasVoted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-yellow-800">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm">
                Waiting for results... <span className="font-semibold">{game.timeRemaining}</span>
              </span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Flag className="mr-1 h-3 w-3" />
              Report
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFarcasterShare(!showFarcasterShare)}
            >
              <Share className="mr-1 h-3 w-3" />
              Share
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{game.timeRemaining}</span>
            </div>
            <Link href={`/game/${game.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Farcaster Share Component */}
        {showFarcasterShare && (
          <div className="mt-4 border-t pt-4">
            <FarcasterShare 
              game={game as any} 
              userScore={game.userVote ? {
                correct: game.userVote.isCorrect,
                selectedStatement: game.userVote.selectedStatement
              } : undefined}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
