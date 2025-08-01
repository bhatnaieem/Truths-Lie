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
        description: "Your Truth Lie game has been published and is now live.",
      });
      // Force refresh all queries
      queryClient.invalidateQueries();
      queryClient.refetchQueries({ queryKey: ['/api/games'] });
      queryClient.refetchQueries({ queryKey: ['/api/activities'] });
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
    
    // Debug logging
    console.log('Form submitted with:', { statements, lieStatement, explanation, allowFriendsOnly });
    console.log('Current user ID:', userId);
    
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create Your Truth Lie Game</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-6">
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
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="friends-only"
                checked={allowFriendsOnly}
                onCheckedChange={(checked) => setAllowFriendsOnly(checked === true)}
              />
              <Label htmlFor="friends-only" className="text-sm text-gray-700">
                Only friends can play
              </Label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-medium border-2 border-purple-600 shadow-lg"
                disabled={createGameMutation.isPending}
                style={{ backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' }}
              >
                {createGameMutation.isPending ? 'Publishing...' : 'Publish Game'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
