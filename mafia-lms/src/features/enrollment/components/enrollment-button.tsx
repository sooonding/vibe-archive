'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEnroll } from '../hooks/use-enroll';
import { useUnenroll } from '../hooks/use-unenroll';
import { useEnrollmentStatus } from '../hooks/use-enrollment-status';
import { ConfirmModal } from './confirm-modal';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

interface EnrollmentButtonProps {
  courseId: string;
}

export const EnrollmentButton = ({ courseId }: EnrollmentButtonProps) => {
  const { toast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<'enroll' | 'unenroll'>('enroll');

  const { data: userRole, isLoading: isLoadingRole } = useUserRole();
  const { data: enrollmentStatus, isLoading: isCheckingStatus } =
    useEnrollmentStatus(courseId);
  const enrollMutation = useEnroll();
  const unenrollMutation = useUnenroll();

  const isEnrolled = enrollmentStatus?.isEnrolled ?? false;
  const isInstructor = userRole?.role === 'instructor';
  const isLoading =
    isCheckingStatus ||
    isLoadingRole ||
    enrollMutation.isPending ||
    unenrollMutation.isPending;

  const handleEnrollClick = () => {
    if (isInstructor) {
      toast({
        title: '수강신청 불가',
        description: 'Instructor 계정은 수강신청을 할 수 없습니다.',
        variant: 'destructive',
      });
      return;
    }
    setAction('enroll');
    setShowConfirm(true);
  };

  const handleUnenrollClick = () => {
    setAction('unenroll');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      if (action === 'enroll') {
        await enrollMutation.mutateAsync({ courseId });
        toast({
          title: '수강신청 완료',
          description: '코스 수강신청이 완료되었습니다.',
        });
      } else {
        await unenrollMutation.mutateAsync(courseId);
        toast({
          title: '수강취소 완료',
          description: '코스 수강신청이 취소되었습니다.',
        });
      }
      setShowConfirm(false);
    } catch (error) {
      toast({
        title: action === 'enroll' ? '수강신청 실패' : '수강취소 실패',
        description:
          error instanceof Error
            ? error.message
            : '오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  if (isCheckingStatus) {
    return (
      <Button disabled variant="outline">
        확인 중...
      </Button>
    );
  }

  // Instructor인 경우 버튼을 표시하지 않음
  if (isInstructor) {
    return null;
  }

  return (
    <>
      {isEnrolled ? (
        <Button
          onClick={handleUnenrollClick}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? '처리 중...' : '수강취소'}
        </Button>
      ) : (
        <Button onClick={handleEnrollClick} disabled={isLoading}>
          {isLoading ? '처리 중...' : '수강신청'}
        </Button>
      )}

      <ConfirmModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirm}
        title={action === 'enroll' ? '수강신청 확인' : '수강취소 확인'}
        description={
          action === 'enroll'
            ? '이 코스를 수강신청 하시겠습니까?'
            : '이 코스의 수강신청을 취소하시겠습니까?'
        }
      />
    </>
  );
};
