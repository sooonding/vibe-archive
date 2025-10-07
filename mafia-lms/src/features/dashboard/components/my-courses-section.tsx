'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CourseCardWithProgress } from './course-card-with-progress';
import type { EnrolledCourse } from '../dto';

interface MyCoursesSectionProps {
  courses: EnrolledCourse[];
}

export const MyCoursesSection = ({ courses }: MyCoursesSectionProps) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          수강신청한 코스가 없습니다. 코스 카탈로그에서 코스를 둘러보세요.
        </p>
        <Button asChild>
          <Link href="/courses">코스 카탈로그 보기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <CourseCardWithProgress key={course.courseId} course={course} />
      ))}
    </div>
  );
};
