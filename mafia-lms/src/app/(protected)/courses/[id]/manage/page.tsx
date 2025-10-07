'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCourseDetailFull } from '@/features/course/hooks/use-course-detail-full';
import { CourseFormDialog } from '@/features/course/components/course-form-dialog';
import { CourseStatusBadge } from '@/features/course/components/course-status-badge';
import { CourseStatusAction } from '@/features/course/components/course-status-action';
import { COURSE_DIFFICULTY_LABELS_KO, type CourseStatus } from '@/constants/course';
import { formatDate } from '@/lib/format/date';

interface CourseManagePageProps {
  params: Promise<{ id: string }>;
}

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'DevOps',
  'Database',
  'Security',
  'Cloud Computing',
  'Other',
];

export default function CourseManagePage({ params }: CourseManagePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: course, isLoading, error } = useCourseDetailFull(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">에러 발생</h2>
          <p className="text-red-400">
            {error.message || '코스 정보를 불러오는데 실패했습니다.'}
          </p>
          <Button
            onClick={() => router.push('/dashboard/instructor')}
            className="mt-4"
            variant="outline"
          >
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{course.title}</h1>
                <CourseStatusBadge status={course.status as CourseStatus} />
              </div>
              <p className="text-slate-300">
                강사: {course.instructorName} • 생성일:{' '}
                {formatDate(course.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500"
              >
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
              <CourseStatusAction
                courseId={course.id}
                currentStatus={course.status as CourseStatus}
                enrolledCount={course.enrolledCount}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">수강생</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{course.enrolledCount}명</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">과제</CardTitle>
              <BookOpen className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{course.assignmentCount}개</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">난이도</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {COURSE_DIFFICULTY_LABELS_KO[
                  course.difficulty as keyof typeof COURSE_DIFFICULTY_LABELS_KO
                ]}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">코스 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-1">설명</h3>
                <p className="text-white whitespace-pre-wrap">
                  {course.description || '설명이 없습니다.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    카테고리
                  </h3>
                  <p className="text-white">{course.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    최종 수정일
                  </h3>
                  <p className="text-white">{formatDate(course.updatedAt)}</p>
                </div>
              </div>

              {course.curriculum && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">
                    커리큘럼
                  </h3>
                  <div className="bg-slate-800/50 p-4 rounded-md">
                    <p className="text-white whitespace-pre-wrap">
                      {course.curriculum}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">과제 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                이 코스의 과제를 관리할 수 있습니다.
              </p>
              <Button
                onClick={() => router.push(`/courses/${course.id}/instructor`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                과제 관리 페이지로 이동
              </Button>
            </CardContent>
          </Card>
        </div>

        <CourseFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          course={course}
          categories={CATEGORIES}
        />
      </div>
    </main>
  );
}
