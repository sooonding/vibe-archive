'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSubmitAssignment } from '../hooks/use-submit-assignment';
import { isValidUrl } from '@/lib/utils/validation';
import type { AssignmentDetail } from '@/features/assignment/dto';
import type { SubmissionHistoryItem } from '../dto';
import { canSubmit, canResubmit } from '@/lib/utils/assignment-status';

interface SubmissionFormProps {
  assignmentId: string;
  assignment: AssignmentDetail;
  latestSubmission: SubmissionHistoryItem | null;
}

export const SubmissionForm = ({
  assignmentId,
  assignment,
  latestSubmission,
}: SubmissionFormProps) => {
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const { toast } = useToast();
  const submitMutation = useSubmitAssignment(assignmentId);

  const canSubmitNow = canSubmit(assignment);
  const canResubmitNow = canResubmit(assignment, latestSubmission);
  const isDisabled = !canSubmitNow && !canResubmitNow;

  const getDisabledReason = () => {
    if (assignment.status === 'closed') {
      return '마감된 과제입니다';
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);

    if (now > dueDate && !assignment.allowLate) {
      return '제출 기한이 지났습니다';
    }

    if (latestSubmission && !assignment.allowResubmission) {
      return '재제출이 허용되지 않습니다';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      toast({
        title: '오류',
        description: '답변을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    if (link && link.trim() !== '' && !isValidUrl(link)) {
      toast({
        title: '오류',
        description: '올바른 URL 형식을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        text,
        link: link.trim() === '' ? null : link,
      });

      toast({
        title: '성공',
        description: canResubmitNow
          ? '재제출이 완료되었습니다'
          : '제출이 완료되었습니다',
      });

      setText('');
      setLink('');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || '제출에 실패했습니다';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const disabledReason = getDisabledReason();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {canResubmitNow ? '재제출하기' : '과제 제출'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDisabled && disabledReason && (
          <p className="text-red-600 mb-4 font-semibold">{disabledReason}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="text">제출 내용 (필수)</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="과제 내용을 작성하세요..."
              rows={8}
              disabled={isDisabled}
              required
            />
          </div>

          <div>
            <Label htmlFor="link">참고 링크 (선택)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              disabled={isDisabled}
            />
          </div>

          <Button
            type="submit"
            disabled={isDisabled || !text.trim() || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending
              ? '제출 중...'
              : canResubmitNow
                ? '재제출하기'
                : '제출하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
