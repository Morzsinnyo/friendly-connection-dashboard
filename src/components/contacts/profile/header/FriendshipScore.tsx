import { Slider } from "@/components/ui/slider";

interface FriendshipScoreProps {
  score: number;
  onScoreChange: (value: number[]) => void;
}

export function FriendshipScore({ score, onScoreChange }: FriendshipScoreProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg mt-2 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-700">Friendship Score</span>
          <span className="text-sm text-green-600">{score}</span>
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