'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, ExternalLink, User, Clock } from 'lucide-react';
import type { SubmissionDetail as SubmissionDetailType } from '../dto';

interface SubmissionDetailProps {
  submission: SubmissionDetailType;
}

export const SubmissionDetail = ({ submission }: SubmissionDetailProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{submission.assignmentTitle}</CardTitle>
            <CardDescription>{submission.courseName}</CardDescription>
          </div>
          {submission.isLate && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              지각 제출
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{submission.learnerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(submission.submittedAt), 'PPP p', { locale: ko })}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">제출 내용</h4>
          <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">
            {submission.submissionText}
          </p>
        </div>

        {submission.submissionLink && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">제출 링크</h4>
            <a
              href={submission.submissionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {submission.submissionLink}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {submission.currentScore !== null && submission.currentFeedback && (
          <>
            <Separator />
            <div className="space-y-3 rounded-md border p-4">
              <h4 className="text-sm font-semibold">이전 채점 내역</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">점수</span>
                  <span className="text-lg font-bold">
                    {submission.currentScore}점
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">피드백</span>
                  <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">
                    {submission.currentFeedback}
                  </p>
                </div>
                {submission.gradedAt && (
                  <p className="text-xs text-muted-foreground">
                    채점일시:{' '}
                    {format(new Date(submission.gradedAt), 'PPP p', {
                      locale: ko,
                    })}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
