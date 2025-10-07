'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CourseGrade } from '../dto';
import { CourseTotalScore } from './course-total-score';
import { AssignmentGradeItem } from './assignment-grade-item';

interface CourseGradeSectionProps {
  course: CourseGrade;
}

export const CourseGradeSection = ({ course }: CourseGradeSectionProps) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl">{course.courseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <CourseTotalScore
          totalScore={course.totalScore}
          maxScore={course.maxScore}
        />

        <div>
          <h3 className="text-lg font-semibold mb-4">과제별 성적</h3>
          <Separator className="mb-4" />

          {course.assignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>등록된 과제가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {course.assignments.map((assignment) => (
                <AssignmentGradeItem
                  key={assignment.assignmentId}
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
