import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface FriendshipScoreProps {
  score: number;
  onScoreChange: (value: number[]) => void;
}

export function FriendshipScore({ score, onScoreChange }: FriendshipScoreProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-4 rounded-lg mt-2 mb-4 relative">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Friendship Score</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600 dark:text-green-400">{score}</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-green-600 dark:text-green-400 cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-3">
                <p className="text-sm text-muted-foreground">
                  The friendship score allows users to assign a number to their contacts based on the frequency of their interactions. For example, a score of 100 represents a best friend with daily interactions.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
        <Slider
          value={[score]}
          onValueChange={onScoreChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );
}