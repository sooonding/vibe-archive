'use client';

import { useState } from 'react';
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
import { useUpdateAssignmentStatus } from '../hooks/use-update-assignment-status';
import {
  getNextAllowedAssignmentStatuses,
  canPublishAssignment,
} from '@/lib/utils/assignment-status';
import {
  ASSIGNMENT_STATUS_LABELS_KO,
  type AssignmentStatus,
} from '@/constants/assignment';

interface AssignmentStatusActionProps {
  assignmentId: string;
  courseId: string;
  currentStatus: AssignmentStatus;
  assignmentData: {
    title?: string;
    description?: string;
    dueDate?: string;
    weight?: number;
  };
}

export function AssignmentStatusAction({
  assignmentId,
  courseId,
  currentStatus,
  assignmentData,
}: AssignmentStatusActionProps) {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus | ''>(
    '',
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const updateStatusMutation = useUpdateAssignmentStatus(
    assignmentId,
    courseId,
  );

  const allowedStatuses = getNextAllowedAssignmentStatuses(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'published' && currentStatus === 'draft') {
      const validation = canPublishAssignment(assignmentData);
      if (!validation.allowed) {
        toast({
          title: '게시할 수 없습니다',
          description: validation.reason,
          variant: 'destructive',
        });
        return;
      }
    }

    setSelectedStatus(newStatus as AssignmentStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({ status: selectedStatus });
      toast({
        title: '과제 상태가 변경되었습니다',
        description: `${ASSIGNMENT_STATUS_LABELS_KO[selectedStatus]}(으)로 변경되었습니다`,
      });
      setShowConfirmDialog(false);
      setSelectedStatus('');
    } catch (error) {
      toast({
        title: '상태 변경에 실패했습니다',
        description:
          error instanceof Error ? error.message : '다시 시도해주세요',
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태 변경" />
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {ASSIGNMENT_STATUS_LABELS_KO[status as AssignmentStatus]}(으)로
                변경
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>과제 상태를 변경하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus && (
                <>
                  현재 상태:{' '}
                  <strong>{ASSIGNMENT_STATUS_LABELS_KO[currentStatus]}</strong>
                  <br />
                  변경할 상태:{' '}
                  <strong>{ASSIGNMENT_STATUS_LABELS_KO[selectedStatus]}</strong>
                  <br />
                  <br />
                  {selectedStatus === 'published' && currentStatus === 'draft' && (
                    <span className="text-yellow-600">
                      과제가 게시되면 모든 수강생에게 노출됩니다.
                    </span>
                  )}
                  {selectedStatus === 'closed' && (
                    <span className="text-yellow-600">
                      과제가 마감되면 학습자는 더 이상 제출할 수 없습니다. 채점은
                      계속 가능합니다.
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
