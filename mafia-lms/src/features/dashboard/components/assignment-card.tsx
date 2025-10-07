'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDueTime } from '@/lib/format/date';
import type { UpcomingAssignment } from '../dto';

interface AssignmentCardProps {
  assignment: UpcomingAssignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const isDueSoon = assignment.dueInHours <= 24;

  return (
    <Card className={isDueSoon ? 'border-red-500' : ''}>
      <CardHeader>
        <CardTitle className="text-base">{assignment.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{assignment.courseName}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span
            className={`text-sm ${isDueSoon ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}
          >
            {formatDueTime(assignment.dueDate)}
          </span>
          <Badge
            variant={
              assignment.submissionStatus === 'resubmission_required'
                ? 'destructive'
                : 'outline'
            }
          >
            {assignment.submissionStatus === 'resubmission_required'
              ? '재제출 필요'
              : '미제출'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
