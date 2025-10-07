'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Users, BarChart, BookOpen } from 'lucide-react';
import { useCourseDetail } from '@/features/course/hooks/use-course-detail';
import { useEnrollmentStatus } from '@/features/enrollment/hooks/use-enrollment-status';
import { useAssignments } from '@/features/assignment/hooks/use-assignments';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { EnrollmentButton } from '@/features/enrollment/components/enrollment-button';
import { InstructorAssignmentSummary } from '@/features/assignment/components/instructor-assignment-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format/date';

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

const difficultyConfig = {
  beginner: { label: '초급', variant: 'secondary' as const },
  intermediate: { label: '중급', variant: 'default' as const },
  advanced: { label: '고급', variant: 'destructive' as const },
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: course, isLoading, error } = useCourseDetail(id);
  const { data: enrollmentStatus } = useEnrollmentStatus(id);
  const { data: userRole } = useUserRole();
  const { data: assignments } = useAssignments(id);

  // Check if current user is the instructor of this course
  const isInstructor = userRole?.role === 'instructor';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">에러 발생</h2>
          <p className="text-red-400 mb-4">
            {error instanceof Error ? error.message : '코스를 불러오는데 실패했습니다.'}
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-purple-600 hover:bg-purple-700">
              {course.category}
            </Badge>
            <Badge variant={difficultyConfig[course.difficulty].variant}>
              {difficultyConfig[course.difficulty].label}
            </Badge>
          </div>

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

          <div className="flex items-center gap-6 text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>강사: {course.instructorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>생성일: {formatDate(course.createdAt)}</span>
            </div>
          </div>

          <p className="text-lg text-slate-300 leading-relaxed">
            {course.description}
          </p>
        </div>

        {!isInstructor && (
          <div className="mb-8">
            <EnrollmentButton courseId={id} />
          </div>
        )}

        {isInstructor ? (
          <div className="mb-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  과제 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments ? (
                  <InstructorAssignmentSummary
                    assignments={assignments}
                    courseId={id}
                  />
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    과제 정보를 불러오는 중...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  과제 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push(`/courses/${id}/assignments`)}
                  disabled={!enrollmentStatus?.isEnrolled}
                >
                  {enrollmentStatus?.isEnrolled ? '과제 보기' : '수강 신청 필요'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart className="h-5 w-5" />
                  내 성적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                  variant="outline"
                  onClick={() => router.push('/grades')}
                >
                  성적 확인
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {course.curriculum && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">커리큘럼</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-slate-300">
                  {course.curriculum}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
