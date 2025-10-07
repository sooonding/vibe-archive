'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSubmissionDetail } from '@/features/grade/hooks/use-submission-detail';
import { SubmissionDetail } from '@/features/grade/components/submission-detail';
import { GradingForm } from '@/features/grade/components/grading-form';

interface GradingPageProps {
  params: Promise<{ submissionId: string }>;
}

export default function GradingPage({ params }: GradingPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: submission, isLoading, error } = useSubmissionDetail(
    resolvedParams.submissionId,
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>
            제출물을 불러오는 중 오류가 발생했습니다. 권한이 없거나 존재하지
            않는 제출물입니다.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
        <h1 className="text-3xl font-bold">제출물 채점</h1>
        <p className="text-muted-foreground mt-2">
          학습자의 제출물을 검토하고 채점하세요.
        </p>
      </div>

      <div className="space-y-6">
        <SubmissionDetail submission={submission} />
        <GradingForm
          submissionId={resolvedParams.submissionId}
          currentScore={submission.currentScore}
          currentFeedback={submission.currentFeedback}
          onSuccess={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}
