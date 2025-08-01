import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GameWithResults } from "@shared/schema";

interface FarcasterShareProps {
  game: GameWithResults;
  userScore?: {
    correct: boolean;
    selectedStatement: number;
  };
}

export default function FarcasterShare({ game, userScore }: FarcasterShareProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    const isCorrect = userScore?.correct;
    const selectedStatement = userScore?.selectedStatement;
    const lieStatement = game.lieStatement;
    
    let shareText = `🎯 Just played Truth Lie!\n\n`;
    
    if (isCorrect !== undefined) {
      shareText += isCorrect 
        ? `✅ I correctly identified the lie (Statement ${lieStatement})!` 
        : `❌ I was fooled! I picked Statement ${selectedStatement} but the lie was Statement ${lieStatement}.`;
      shareText += `\n\n`;
    }
    
    shareText += `The statements were:\n`;
    const statements = Array.isArray(game.statements) ? game.statements : [];
    statements.forEach((statement: string, index: number) => {
      const emoji = index + 1 === lieStatement ? "🔥" : "✅";
      shareText += `${emoji} ${statement}\n`;
    });
    
    shareText += `\nCan you spot the lie? Play at truthlie.game`;
    
    return shareText;
  };

  const generateWarpcastUrl = () => {
    const text = encodeURIComponent(generateShareText());
    return `https://warpcast.com/~/compose?text=${text}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Share text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openWarpcast = () => {
    window.open(generateWarpcastUrl(), '_blank');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Share on Farcaster</h3>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm whitespace-pre-line text-gray-700">
              {generateShareText()}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={openWarpcast}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share on Warpcast
            </Button>
            
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Share your results with the Farcaster community
          </div>
        </div>
      </CardContent>
    </Card>
  );
}