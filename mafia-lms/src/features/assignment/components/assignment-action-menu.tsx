'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Trash, FileText, Eye, EyeOff, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDeleteAssignment } from '../hooks/use-delete-assignment';
import { useUpdateAssignmentStatus } from '../hooks/use-update-assignment-status';
import type { CourseAssignment } from '../dto';
import { AssignmentFormDialog } from './assignment-form-dialog';

interface AssignmentActionMenuProps {
  assignment: CourseAssignment;
  courseId: string;
}

export function AssignmentActionMenu({
  assignment,
  courseId,
}: AssignmentActionMenuProps) {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteAssignment(assignment.id, courseId);
  const statusMutation = useUpdateAssignmentStatus(assignment.id, courseId);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast({
        title: '과제가 삭제되었습니다',
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: '과제 삭제에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (status: 'draft' | 'published' | 'closed') => {
    try {
      await statusMutation.mutateAsync({ status });
      toast({
        title: `과제가 ${
          status === 'draft'
            ? '임시저장'
            : status === 'published'
              ? '공개'
              : '마감'
        }되었습니다`,
      });
    } catch (error) {
      toast({
        title: '상태 변경에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    }
  };

  const canPublish = assignment.status === 'draft';
  const canClose = assignment.status === 'published';
  const canEdit = assignment.status !== 'closed';
  const canDelete = assignment.status === 'draft';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              수정
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <a href={`/assignments/${assignment.id}/submissions`}>
              <FileText className="mr-2 h-4 w-4" />
              제출 내역
            </a>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canPublish && (
            <DropdownMenuItem onClick={() => handleStatusChange('published')}>
              <Eye className="mr-2 h-4 w-4" />
              공개
            </DropdownMenuItem>
          )}

          {assignment.status === 'published' && (
            <DropdownMenuItem onClick={() => handleStatusChange('draft')}>
              <EyeOff className="mr-2 h-4 w-4" />
              비공개
            </DropdownMenuItem>
          )}

          {canClose && (
            <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
              <Lock className="mr-2 h-4 w-4" />
              마감
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignmentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        courseId={courseId}
        assignment={assignment as any}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>과제를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 과제가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
