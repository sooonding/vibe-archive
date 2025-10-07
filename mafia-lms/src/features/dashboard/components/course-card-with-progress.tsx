'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from './progress-bar';
import { formatRelativeTime } from '@/lib/format/date';
import type { EnrolledCourse } from '../dto';

interface CourseCardWithProgressProps {
  course: EnrolledCourse;
}

export const CourseCardWithProgress = ({
  course,
}: CourseCardWithProgressProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {course.instructorName} · {course.category} · {course.difficulty}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProgressBar
          progress={course.progress}
          total={course.totalAssignments}
          completed={course.completedAssignments}
        />
        <p className="text-xs text-muted-foreground">
          수강신청일: {formatRelativeTime(course.enrolledAt)}
        </p>
      </CardContent>
    </Card>
  );
};
