'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssignmentDetail } from '../dto';
import { format, isPast, differenceInHours } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AssignmentDetailViewProps {
  assignment: AssignmentDetail;
}

export const AssignmentDetailView = ({
  assignment,
}: AssignmentDetailViewProps) => {
  const dueDate = new Date(assignment.dueDate);
  const isDue = isPast(dueDate);
  const hoursUntilDue = differenceInHours(dueDate, new Date());
  const isUrgent = hoursUntilDue > 0 && hoursUntilDue <= 24;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{assignment.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {assignment.courseName}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">과제 설명</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">마감일</h4>
            <div
              className={`text-sm ${
                isUrgent ? 'text-red-600 font-bold' : isDue ? 'text-gray-500' : ''
              }`}
            >
              {format(dueDate, 'PPP p', { locale: ko })}
              {isDue && <Badge className="ml-2 bg-gray-500">마감됨</Badge>}
              {isUrgent && (
                <Badge variant="destructive" className="ml-2">
                  24시간 이내
                </Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">점수 비중</h4>
            <p className="text-sm text-muted-foreground">{assignment.weight}%</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">지각 제출</h4>
            <div className="text-sm">
              {assignment.allowLate ? (
                <Badge className="bg-green-600">가능</Badge>
              ) : (
                <Badge variant="secondary">불가</Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">재제출</h4>
            <div className="text-sm">
              {assignment.allowResubmission ? (
                <Badge className="bg-green-600">가능</Badge>
              ) : (
                <Badge variant="secondary">불가</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
