'use client';

import { useInstructorDashboard } from '@/features/dashboard/hooks/use-instructor-dashboard';
import { InstructorCourseCard } from '@/features/dashboard/components/instructor-course-card';
import { PendingSubmissionsSection } from '@/features/dashboard/components/pending-submissions-section';
import { RecentSubmissionsSection } from '@/features/dashboard/components/recent-submissions-section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InstructorDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useInstructorDashboard();

  useEffect(() => {
    if (error && error.message.includes('INVALID_ROLE')) {
      router.push('/dashboard');
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8 px-4">
          <p className="text-slate-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8 px-4">
          <p className="text-red-400">에러 발생: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
        <header>
          <h1 className="text-3xl font-bold">Instructor 대시보드</h1>
          <p className="text-slate-400 mt-2">강사 페이지에 오신 것을 환영합니다.</p>
        </header>

        <PendingSubmissionsSection count={data.pendingSubmissionsCount} />

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-white">내 코스</h2>
            <Button asChild variant="outline" className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
              <Link href="/courses/create">새 코스 만들기</Link>
            </Button>
          </div>

          {data.courses.length === 0 ? (
            <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-600">
              <p className="text-slate-300 mb-4">생성한 코스가 없습니다.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/courses/create">첫 코스 만들기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.courses.map((course) => (
                <InstructorCourseCard key={course.courseId} course={course} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">최근 제출물</h2>
          <RecentSubmissionsSection submissions={data.recentSubmissions} />
        </section>
      </div>
    </main>
  );
}
