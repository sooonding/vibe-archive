'use client';

import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/format/date';
import type { RecentSubmission } from '../dto';

interface SubmissionItemProps {
  submission: RecentSubmission;
}

export const SubmissionItem = ({ submission }: SubmissionItemProps) => {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-600 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-white">
          {submission.assignmentTitle}
        </p>
        <p className="text-sm text-slate-300">
          {submission.learnerName} ·{' '}
          {formatRelativeTime(submission.submittedAt)}
        </p>
      </div>
      {submission.isLate && (
        <Badge variant="destructive" className="ml-2">
          지각
        </Badge>
      )}
    </div>
  );
};
