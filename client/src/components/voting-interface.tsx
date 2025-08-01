import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { GameWithCreator } from "@shared/schema";

interface VotingInterfaceProps {
  game: GameWithCreator;
  currentUserId: string;
}

export default function VotingInterface({ game, currentUserId }: VotingInterfaceProps) {
  const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
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
      queryClient.invalidateQueries({ queryKey: ['/api/games', game.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = () => {
    if (selectedStatement && !game.hasVoted) {
      voteMutation.mutate(selectedStatement);
    }
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
    
    if (selectedStatement === statementNumber) {
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
    <div>
      <div className="space-y-4 mb-6">
        {statements.map((statement, index) => (
          <div 
            key={index}
            className={`p-4 border-2 rounded-xl transition-all ${getStatementStyle(index)}`}
            onClick={() => !game.hasVoted && setSelectedStatement(index + 1)}
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-900 flex-1 pr-4">{statement}</p>
              {getVoteIndicator(index)}
            </div>
          </div>
        ))}
      </div>
      
      {game.hasVoted ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center text-yellow-800">
            <Clock className="mr-2 h-4 w-4" />
            <div>
              <p className="font-medium">You voted that statement {game.userVote?.selectedStatement} is the lie</p>
              <p className="text-sm">Results will be revealed when the game ends: {game.timeRemaining}</p>
            </div>
          </div>
        </div>
      ) : !game.isActive ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-center">This game has ended. Results are available.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Select which statement you think is the lie, then submit your vote.
          </p>
          <Button 
            onClick={handleVote}
            disabled={!selectedStatement || voteMutation.isPending}
            className="bg-farcaster hover:bg-farcaster-dark"
          >
            {voteMutation.isPending ? 'Voting...' : 'Submit Vote'}
          </Button>
        </div>
      )}
    </div>
  );
}
