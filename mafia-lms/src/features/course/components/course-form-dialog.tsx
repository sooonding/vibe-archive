'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateCourse } from '../hooks/use-create-course';
import { useUpdateCourse } from '../hooks/use-update-course';
import { CreateCourseRequestSchema } from '../dto';
import type { CourseDetailFull } from '../dto';
import { COURSE_DIFFICULTY, COURSE_DIFFICULTY_LABELS_KO } from '@/constants/course';

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseDetailFull;
  categories: string[];
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  categories,
}: CourseFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse(course?.id || '');

  const form = useForm({
    resolver: zodResolver(CreateCourseRequestSchema),
    defaultValues: course
      ? {
          title: course.title,
          description: course.description || '',
          category: course.category,
          difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
          curriculum: course.curriculum || '',
        }
      : {
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner' as const,
          curriculum: '',
        },
  });

  const onSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      if (course) {
        await updateMutation.mutateAsync(values);
        toast({
          title: '코스가 수정되었습니다',
        });
      } else {
        await createMutation.mutateAsync(values);
        toast({
          title: '코스가 생성되었습니다',
        });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: course ? '코스 수정에 실패했습니다' : '코스 생성에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? '코스 수정' : '새 코스 만들기'}</DialogTitle>
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
                    <Input {...field} placeholder="코스 제목을 입력하세요" />
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
                      placeholder="코스 설명을 입력하세요 (최소 10자)"
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>난이도</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="난이도 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={COURSE_DIFFICULTY.BEGINNER}>
                          {COURSE_DIFFICULTY_LABELS_KO[COURSE_DIFFICULTY.BEGINNER]}
                        </SelectItem>
                        <SelectItem value={COURSE_DIFFICULTY.INTERMEDIATE}>
                          {COURSE_DIFFICULTY_LABELS_KO[COURSE_DIFFICULTY.INTERMEDIATE]}
                        </SelectItem>
                        <SelectItem value={COURSE_DIFFICULTY.ADVANCED}>
                          {COURSE_DIFFICULTY_LABELS_KO[COURSE_DIFFICULTY.ADVANCED]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="curriculum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>커리큘럼 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="커리큘럼 내용을 입력하세요"
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription>
                    마크다운 형식을 지원합니다
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  : course
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
