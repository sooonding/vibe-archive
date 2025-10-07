'use client';

import { FeedbackCard } from './feedback-card';
import type { FeedbackItem } from '../dto';

interface RecentFeedbackSectionProps {
  feedback: FeedbackItem[];
}

export const RecentFeedbackSection = ({
  feedback,
}: RecentFeedbackSectionProps) => {
  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">아직 받은 피드백이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((item, index) => (
        <FeedbackCard key={index} feedback={item} />
      ))}
    </div>
  );
};
