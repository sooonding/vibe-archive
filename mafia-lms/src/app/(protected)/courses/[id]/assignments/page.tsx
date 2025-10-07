'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useAssignments } from '@/features/assignment/hooks/use-assignments';
import { AssignmentList } from '@/features/assignment/components/assignment-list';

interface AssignmentsPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentsPage({ params }: AssignmentsPageProps) {
  const { id } = use(params);
  const { data: assignments, isLoading, error } = useAssignments(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    const isNotEnrolled = error.message?.includes('NOT_ENROLLED') ||
                          error.message?.includes('not enrolled');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">
            {isNotEnrolled ? '접근 불가' : '에러 발생'}
          </h2>
          <p className="text-red-400 mb-6">
            {isNotEnrolled
              ? '이 코스에 등록되지 않았습니다. 먼저 코스에 수강 신청을 해주세요.'
              : error.message || '과제 목록을 불러오는데 실패했습니다.'}
          </p>
          {isNotEnrolled && (
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              대시보드로 돌아가기
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">과제 목록</h1>
          <p className="text-slate-400">
            {assignments?.length || 0}개의 과제가 있습니다.
          </p>
        </header>

        <AssignmentList assignments={assignments || []} />
      </div>
    </main>
  );
}
