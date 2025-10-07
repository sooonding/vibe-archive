'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCreateAssignment } from '../hooks/use-create-assignment';
import { useUpdateAssignment } from '../hooks/use-update-assignment';
import { useUpdateAssignmentStatus } from '../hooks/use-update-assignment-status';
import type { AssignmentDetail } from '../dto';

const assignmentFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: '올바른 날짜 형식이 아닙니다',
  }),
  weight: z.coerce.number().min(0).max(100, '점수 비중은 0~100 사이여야 합니다'),
  allowLate: z.boolean().default(false),
  allowResubmission: z.boolean().default(false),
  publishImmediately: z.boolean().default(false),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  assignment?: AssignmentDetail;
}

export function AssignmentFormDialog({
  open,
  onOpenChange,
  courseId,
  assignment,
}: AssignmentFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAssignmentId, setCreatedAssignmentId] = useState<string | null>(null);
  const createMutation = useCreateAssignment(courseId);
  const updateMutation = useUpdateAssignment(assignment?.id || '', courseId);
  const statusMutation = useUpdateAssignmentStatus(createdAssignmentId || '', courseId);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: assignment
      ? {
          title: assignment.title,
          description: assignment.description,
          dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
          weight: assignment.weight,
          allowLate: assignment.allowLate,
          allowResubmission: assignment.allowResubmission,
          publishImmediately: false,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
          weight: 0,
          allowLate: false,
          allowResubmission: false,
          publishImmediately: false,
        },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      setIsSubmitting(true);

      const { publishImmediately, ...restValues } = values;
      const data = {
        ...restValues,
        dueDate: new Date(restValues.dueDate).toISOString(),
      };

      if (assignment) {
        await updateMutation.mutateAsync(data);
        toast({
          title: '과제가 수정되었습니다',
        });
      } else {
        const result = await createMutation.mutateAsync(data);

        if (publishImmediately && result?.id) {
          setCreatedAssignmentId(result.id);
          await statusMutation.mutateAsync({ status: 'published' });
          toast({
            title: '과제가 생성되고 공개되었습니다',
          });
        } else {
          toast({
            title: '과제가 생성되었습니다',
          });
        }
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: assignment ? '과제 수정에 실패했습니다' : '과제 생성에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignment ? '과제 수정' : '새 과제 만들기'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="과제 제목을 입력하세요" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="과제 설명을 입력하세요"
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>마감일</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>점수 비중 (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowLate"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">지각 제출 허용</FormLabel>
                    <FormDescription>
                      마감일 이후에도 제출을 허용합니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowResubmission"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">재제출 허용</FormLabel>
                    <FormDescription>
                      제출 후 다시 제출할 수 있도록 허용합니다
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!assignment && (
              <FormField
                control={form.control}
                name="publishImmediately"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">생성 후 바로 공개</FormLabel>
                      <FormDescription>
                        과제를 생성하자마자 학생들에게 공개합니다
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? '처리중...'
                  : assignment
                    ? '수정'
                    : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
