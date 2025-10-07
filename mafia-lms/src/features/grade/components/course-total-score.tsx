'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatScore } from '@/lib/utils/score';

interface CourseTotalScoreProps {
  totalScore: number;
  maxScore: number;
}

export const CourseTotalScore = ({
  totalScore,
  maxScore,
}: CourseTotalScoreProps) => {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return (
    <Card className="border-border bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">코스 총점</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-purple-600">
            {formatScore(totalScore)}
          </span>
          <span className="text-lg text-muted-foreground">/ {maxScore}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-medium">{formatScore(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
