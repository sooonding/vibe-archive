'use client';

import { use } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAssignmentDetail } from '@/features/assignment/hooks/use-assignment-detail';
import { AssignmentSubmissionList } from '@/features/assignment/components/assignment-submission-list';

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id } = use(params);
  const {
    data: assignment,
    isLoading,
    error,
  } = useAssignmentDetail(id);

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
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">에러 발생</h2>
          <p className="text-red-400 mb-6">
            {error.message || '과제 정보를 불러오는데 실패했습니다.'}
          </p>
          <Button asChild>
            <Link href="/dashboard/instructor">대시보드로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="mb-4 text-slate-300 hover:text-white"
          >
            <Link href={`/courses/${assignment.courseId}/instructor`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              과제 목록으로
            </Link>
          </Button>

          <header>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <div className="text-slate-300 space-y-1">
              <p>코스: {assignment.courseName}</p>
              <p>마감일: {new Date(assignment.dueDate).toLocaleString('ko-KR')}</p>
            </div>
          </header>
        </div>

        <AssignmentSubmissionList assignmentId={id} />
      </div>
    </main>
  );
}
