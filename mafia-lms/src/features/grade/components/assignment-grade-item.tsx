'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssignmentGrade } from '../dto';
import {
  formatSubmissionStatus,
  getSubmissionStatusColor,
} from '@/lib/format/submission-status';

interface AssignmentGradeItemProps {
  assignment: AssignmentGrade;
}

export const AssignmentGradeItem = ({
  assignment,
}: AssignmentGradeItemProps) => {
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const statusText = formatSubmissionStatus(assignment.submissionStatus);
  const statusColor = getSubmissionStatusColor(assignment.submissionStatus);

  const hasScore = assignment.score !== null;
  const hasFeedback =
    assignment.feedback !== null && assignment.feedback.trim().length > 0;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-base">
                {assignment.assignmentTitle}
              </h4>
              <Badge variant="outline" className="text-xs">
                비중 {assignment.weight}%
              </Badge>
              {assignment.late && (
                <Badge
                  variant="destructive"
                  className="text-xs flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  지각
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className={statusColor}>{statusText}</span>
              {hasScore && (
                <span className="font-bold text-lg">
                  {assignment.score}점 / 100점
                </span>
              )}
            </div>

            {assignment.submittedAt && (
              <p className="text-xs text-muted-foreground">
                제출일: {new Date(assignment.submittedAt).toLocaleString('ko-KR')}
              </p>
            )}

            {assignment.gradedAt && (
              <p className="text-xs text-muted-foreground">
                채점일: {new Date(assignment.gradedAt).toLocaleString('ko-KR')}
              </p>
            )}

            {hasFeedback && (
              <div className="mt-3">
                <button
                  onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  강사 피드백
                  {isFeedbackExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {isFeedbackExpanded && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {assignment.feedback}
                  </div>
                )}
              </div>
            )}

            {assignment.submissionStatus === 'resubmission_required' && (
              <div className="mt-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  재제출이 필요합니다
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
