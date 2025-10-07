'use client';

import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyGrades } from '@/features/grade/hooks/use-my-grades';
import { CourseGradeSection } from '@/features/grade/components/course-grade-section';

export default function GradesPage() {
  const { data, isLoading, error } = useMyGrades();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-destructive text-lg">
            성적을 불러오는데 실패했습니다
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : '알 수 없는 오류'}
          </p>
        </div>
      </div>
    );
  }

  const courses = data?.courses ?? [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">성적 & 피드백</h1>
        <p className="text-muted-foreground">
          수강 중인 코스의 성적과 강사 피드백을 확인하세요
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">수강 중인 코스가 없습니다</h2>
            <p className="text-muted-foreground">
              코스 카탈로그에서 원하는 코스를 수강신청해보세요
            </p>
          </div>
          <Button asChild>
            <Link href="/">코스 카탈로그 보기</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <CourseGradeSection key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
