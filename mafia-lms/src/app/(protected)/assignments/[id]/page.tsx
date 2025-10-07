'use client';

import { use } from 'react';
import { Loader2 } from 'lucide-react';
import { useAssignmentDetail } from '@/features/assignment/hooks/use-assignment-detail';
import { useSubmissionHistory } from '@/features/submission/hooks/use-submission-history';
import { AssignmentDetailView } from '@/features/assignment/components/assignment-detail-view';
import { SubmissionForm } from '@/features/submission/components/submission-form';
import { SubmissionHistory } from '@/features/submission/components/submission-history';

interface AssignmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { id } = use(params);
  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useAssignmentDetail(id);
  const {
    data: submissions,
    isLoading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useSubmissionHistory(id);

  const isLoading = assignmentLoading || submissionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (assignmentError) {
    const isNotEnrolled = assignmentError.message?.includes('NOT_ENROLLED') ||
                          assignmentError.message?.includes('not enrolled');
    const isNotPublished = assignmentError.message?.includes('NOT_PUBLISHED') ||
                           assignmentError.message?.includes('not yet published');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">
            {isNotEnrolled ? '접근 불가' : isNotPublished ? '비공개 과제' : '에러 발생'}
          </h2>
          <p className="text-red-400 mb-6">
            {isNotEnrolled
              ? '이 코스에 등록되지 않았습니다. 먼저 코스에 수강 신청을 해주세요.'
              : isNotPublished
              ? '이 과제는 아직 게시되지 않았습니다.'
              : assignmentError.message || '과제 정보를 불러오는데 실패했습니다.'}
          </p>
          {(isNotEnrolled || isNotPublished) && (
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

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <p className="text-red-400">과제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const latestSubmission =
    submissions && submissions.length > 0 ? submissions[0] : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
        <AssignmentDetailView assignment={assignment} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SubmissionForm
            assignmentId={id}
            assignment={assignment}
            latestSubmission={latestSubmission}
          />

          <SubmissionHistory submissions={submissions || []} />
        </div>
      </div>
    </main>
  );
}
