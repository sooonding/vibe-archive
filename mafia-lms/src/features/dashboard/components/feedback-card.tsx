'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/format/date';
import type { FeedbackItem } from '../dto';

interface FeedbackCardProps {
  feedback: FeedbackItem;
}

export const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{feedback.assignmentTitle}</CardTitle>
        <p className="text-sm text-muted-foreground">{feedback.courseName}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {feedback.score !== null && (
          <p className="text-sm font-semibold">점수: {feedback.score}</p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {feedback.feedback}
        </p>
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(feedback.gradedAt)}
          </span>
          {feedback.isResubmissionRequired && (
            <Badge variant="destructive">재제출 필요</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
