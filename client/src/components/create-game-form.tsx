import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface CreateGameFormProps {
  userId: string;
  onClose: () => void;
}

export default function CreateGameForm({ userId, onClose }: CreateGameFormProps) {
  const [statements, setStatements] = useState(['', '', '']);
  const [lieStatement, setLieStatement] = useState<number | null>(null);
  const [explanation, setExplanation] = useState('');
  const [allowFriendsOnly, setAllowFriendsOnly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create game');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Game created!",
        description: "Your truth or lie game has been published and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      onClose();
      // Reset form
      setStatements(['', '', '']);
      setLieStatement(null);
      setExplanation('');
      setAllowFriendsOnly(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (statements.some(s => !s.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all three statements.",
        variant: "destructive",
      });
      return;
    }
    
    if (!lieStatement) {
      toast({
        title: "Error",
        description: "Please select which statement is the lie.",
        variant: "destructive",
      });
      return;
    }

    createGameMutation.mutate({
      creatorId: userId,
      statements: statements.map(s => s.trim()),
      lieStatement,
      explanation: explanation.trim() || undefined,
      allowFriendsOnly,
    });
  };

  const updateStatement = (index: number, value: string) => {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Your Truth or Lie Game</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {statements.map((statement, index) => (
            <div key={index}>
              <Label htmlFor={`statement-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                Statement {index + 1}
              </Label>
              <Textarea
                id={`statement-${index}`}
                value={statement}
                onChange={(e) => updateStatement(index, e.target.value)}
                placeholder={`Enter your ${index === 0 ? 'first' : index === 1 ? 'second' : 'third'} statement...`}
                maxLength={280}
                rows={2}
                className="resize-none"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {statement.length}/280
              </div>
            </div>
          ))}
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Which statement is the lie?
            </Label>
            <Select value={lieStatement?.toString() || ""} onValueChange={(value) => setLieStatement(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select the lie..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Statement 1</SelectItem>
                <SelectItem value="2">Statement 2</SelectItem>
                <SelectItem value="3">Statement 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="explanation" className="text-sm font-medium text-gray-700 mb-2 block">
              Explanation (optional)
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain your statements after the game ends..."
              maxLength={500}
              rows={2}
              className="resize-none"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {explanation.length}/500
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="friends-only"
                checked={allowFriendsOnly}
                onCheckedChange={setAllowFriendsOnly}
              />
              <Label htmlFor="friends-only" className="text-sm text-gray-700">
                Only friends can play
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="bg-farcaster hover:bg-farcaster-dark"
              disabled={createGameMutation.isPending}
            >
              {createGameMutation.isPending ? 'Publishing...' : 'Publish Game'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
