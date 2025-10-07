'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { useCreateCourse } from '@/features/course/hooks/use-create-course';
import { CreateCourseRequestSchema } from '@/features/course/dto';
import { COURSE_DIFFICULTY, COURSE_DIFFICULTY_LABELS_KO } from '@/constants/course';

const CATEGORIES = [
  'Programming',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'DevOps',
  'Database',
  'Security',
  'Cloud Computing',
  'Other',
];

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateCourse();

  const form = useForm({
    resolver: zodResolver(CreateCourseRequestSchema),
    defaultValues: {
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

      const result = await createMutation.mutateAsync(values);

      toast({
        title: '코스가 생성되었습니다',
        description: '코스 관리 페이지로 이동합니다',
      });

      router.push(`/courses/${result.id}/manage`);
    } catch (error) {
      toast({
        title: '코스 생성에 실패했습니다',
        description: error instanceof Error ? error.message : '다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">새 코스 만들기</h1>
          <p className="text-slate-300">
            새로운 코스를 생성합니다. 생성된 코스는 초안(Draft) 상태로 저장됩니다.
          </p>
        </header>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">코스 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">제목 *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="코스 제목을 입력하세요"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
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
                      <FormLabel className="text-slate-200">설명 *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="코스 설명을 입력하세요 (최소 10자)"
                          rows={5}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        학습자가 코스를 선택할 때 참고할 수 있도록 자세히 작성해주세요.
                      </FormDescription>
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
                        <FormLabel className="text-slate-200">카테고리 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
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
                        <FormLabel className="text-slate-200">난이도 *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
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
                      <FormLabel className="text-slate-200">커리큘럼 (선택)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="커리큘럼 내용을 입력하세요"
                          rows={8}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-400">
                        마크다운 형식을 지원합니다. 주차별 학습 내용을 작성해주세요.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? '생성 중...' : '코스 생성'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
