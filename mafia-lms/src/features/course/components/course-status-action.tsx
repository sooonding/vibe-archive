'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUpdateCourseStatus } from '../hooks/use-update-course-status';
import { getNextAllowedStatuses } from '@/lib/utils/course-status';
import { COURSE_STATUS_LABELS_KO, type CourseStatus } from '@/constants/course';

interface CourseStatusActionProps {
  courseId: string;
  currentStatus: CourseStatus;
  enrolledCount: number;
}

export function CourseStatusAction({
  courseId,
  currentStatus,
  enrolledCount,
}: CourseStatusActionProps) {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | ''>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const updateStatusMutation = useUpdateCourseStatus(courseId);

  const allowedStatuses = getNextAllowedStatuses(currentStatus, enrolledCount);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus as CourseStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({ status: selectedStatus });
      toast({
        title: '코스 상태가 변경되었습니다',
        description: `${COURSE_STATUS_LABELS_KO[selectedStatus]}(으)로 변경되었습니다`,
      });
      setShowConfirmDialog(false);
      setSelectedStatus('');
    } catch (error) {
      toast({
        title: '상태 변경에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    }
  };

  if (allowedStatuses.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
            <SelectValue placeholder="상태 변경" className="text-white" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {allowedStatuses.map((status) => (
              <SelectItem key={status} value={status} className="text-white hover:bg-slate-700">
                {COURSE_STATUS_LABELS_KO[status]}(으)로 변경
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>코스 상태를 변경하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus && (
                <>
                  현재 상태: <strong>{COURSE_STATUS_LABELS_KO[currentStatus]}</strong>
                  <br />
                  변경할 상태: <strong>{COURSE_STATUS_LABELS_KO[selectedStatus]}</strong>
                  <br />
                  <br />
                  {selectedStatus === 'published' && currentStatus === 'draft' && (
                    <span className="text-yellow-600">
                      코스가 공개되면 학습자들이 수강 신청할 수 있습니다.
                    </span>
                  )}
                  {selectedStatus === 'archived' && (
                    <span className="text-yellow-600">
                      코스가 보관되면 신규 수강 신청이 차단됩니다. 기존 수강생은 유지됩니다.
                    </span>
                  )}
                  {selectedStatus === 'published' && currentStatus === 'archived' && (
                    <span className="text-yellow-600">
                      코스를 다시 공개하면 신규 수강 신청이 가능해집니다.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? '처리중...' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
