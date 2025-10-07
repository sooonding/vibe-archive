'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useGradeSubmission } from '../hooks/use-grade-submission';
import { GradeSubmissionRequestSchema } from '../dto';
import { Loader2, CheckCircle, RotateCcw } from 'lucide-react';

interface GradingFormProps {
  submissionId: string;
  currentScore?: number | null;
  currentFeedback?: string | null;
  onSuccess?: () => void;
}

export const GradingForm = ({
  submissionId,
  currentScore,
  currentFeedback,
  onSuccess,
}: GradingFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isResubmitMode, setIsResubmitMode] = useState(false);
  const gradeSubmissionMutation = useGradeSubmission(submissionId);

  const form = useForm<z.infer<typeof GradeSubmissionRequestSchema>>({
    resolver: zodResolver(GradeSubmissionRequestSchema),
    defaultValues: {
      score: currentScore ?? 0,
      feedback: currentFeedback ?? '',
    },
  });

  const onSubmit = async (
    values: z.infer<typeof GradeSubmissionRequestSchema>,
  ) => {
    try {
      await gradeSubmissionMutation.mutateAsync(values);
      toast({
        title: '채점 완료',
        description: '채점이 성공적으로 완료되었습니다.',
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast({
        title: '채점 실패',
        description:
          error instanceof Error
            ? error.message
            : '채점 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const onRequestResubmit = async () => {
    const feedback = form.getValues('feedback');
    if (!feedback || feedback.trim().length === 0) {
      toast({
        title: '피드백 필수',
        description: '재제출 요청 시 피드백을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await gradeSubmissionMutation.mutateAsync({
        resubmit: true,
        feedback,
      });
      toast({
        title: '재제출 요청 완료',
        description: '학습자에게 재제출 요청을 전달했습니다.',
      });
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast({
        title: '재제출 요청 실패',
        description:
          error instanceof Error
            ? error.message
            : '재제출 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>채점하기</CardTitle>
        <CardDescription>
          점수와 피드백을 입력하여 제출물을 채점하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>점수 (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseInt(value, 10));
                      }}
                      disabled={isResubmitMode}
                    />
                  </FormControl>
                  <FormDescription>
                    0점에서 100점 사이의 정수를 입력하세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>피드백 (필수)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="학습자에게 전달할 피드백을 작성하세요..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    학습자에게 도움이 되는 구체적인 피드백을 작성해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={gradeSubmissionMutation.isPending}
                className="flex-1"
              >
                {gradeSubmissionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    채점 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    채점 완료
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onRequestResubmit}
                disabled={gradeSubmissionMutation.isPending}
                className="flex-1"
              >
                {gradeSubmissionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    재제출 요청
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
