'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmissionItem } from './submission-item';
import type { RecentSubmission } from '../dto';

interface RecentSubmissionsSectionProps {
  submissions: RecentSubmission[];
}

export const RecentSubmissionsSection = ({
  submissions,
}: RecentSubmissionsSectionProps) => {
  if (submissions.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white font-semibold">최근 제출물</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-slate-300">
            아직 제출된 과제가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white font-semibold">최근 제출물</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.map((submission) => (
          <SubmissionItem key={submission.submissionId} submission={submission} />
        ))}
      </CardContent>
    </Card>
  );
};
