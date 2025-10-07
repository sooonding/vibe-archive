'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CourseAssignment } from '../dto';
import { formatRelativeTime } from '@/lib/format/date';
import { differenceInHours } from 'date-fns';

interface AssignmentListProps {
  assignments: CourseAssignment[];
}

const getStatusBadge = (
  status: 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required',
) => {
  const variants = {
    not_submitted: { label: '미제출', className: 'bg-gray-500' },
    submitted: { label: '제출완료', className: 'bg-blue-500' },
    graded: { label: '채점완료', className: 'bg-green-500' },
    resubmission_required: { label: '재제출필요', className: 'bg-orange-500' },
  };

  const variant = variants[status];
  return <Badge className={variant.className}>{variant.label}</Badge>;
};

export const AssignmentList = ({ assignments }: AssignmentListProps) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>게시된 과제가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {assignments.map((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const hoursUntilDue = differenceInHours(dueDate, new Date());
        const isUrgent = hoursUntilDue > 0 && hoursUntilDue <= 24;

        return (
          <Link key={assignment.id} href={`/assignments/${assignment.id}`}>
            <Card
              className={`hover:shadow-lg transition-all cursor-pointer ${
                isUrgent ? 'border-red-500 border-2' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  {getStatusBadge(assignment.submissionStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className={isUrgent ? 'text-red-600 font-bold' : ''}>
                    마감: {formatRelativeTime(assignment.dueDate)}
                  </span>
                  {isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      24시간 이내
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
