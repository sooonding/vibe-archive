'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubmissionHistoryItem } from '../dto';
import { formatRelativeTime } from '@/lib/format/date';

interface SubmissionHistoryProps {
  submissions: SubmissionHistoryItem[];
}

export const SubmissionHistory = ({ submissions }: SubmissionHistoryProps) => {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>제출 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            아직 제출하지 않았습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>제출 이력</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className={`border rounded-lg p-4 ${
              submission.status === 'resubmission_required'
                ? 'bg-orange-50 border-orange-300'
                : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-muted-foreground">
                제출일: {formatRelativeTime(submission.submittedAt)}
              </p>
              <div className="flex gap-2">
                {submission.late && (
                  <Badge variant="destructive" className="text-xs">
                    지각
                  </Badge>
                )}
                {submission.status === 'resubmission_required' && (
                  <Badge className="bg-orange-500 text-xs">재제출 필요</Badge>
                )}
                {submission.status === 'graded' && (
                  <Badge className="bg-green-500 text-xs">채점완료</Badge>
                )}
              </div>
            </div>

            <div className="mb-2">
              <p className="text-sm whitespace-pre-wrap">{submission.text}</p>
              {submission.link && (
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {submission.link}
                </a>
              )}
            </div>

            {submission.grade && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">점수:</span>
                  <span className="text-lg font-bold text-green-600">
                    {submission.grade.score}점
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatRelativeTime(submission.grade.gradedAt)} 채점)
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-sm">피드백:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {submission.grade.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
