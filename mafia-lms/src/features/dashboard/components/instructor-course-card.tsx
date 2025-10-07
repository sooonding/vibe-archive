'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';
import type { InstructorCourse } from '../dto';

interface InstructorCourseCardProps {
  course: InstructorCourse;
}

export const InstructorCourseCard = ({
  course,
}: InstructorCourseCardProps) => {
  const router = useRouter();

  const statusBadgeVariant = {
    draft: 'secondary',
    published: 'default',
    archived: 'outline',
  } as const;

  const statusLabel = {
    draft: '작성 중',
    published: '공개',
    archived: '보관',
  } as const;

  return (
    <Card className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
      <Link href={`/courses/${course.courseId}/manage`} className="block">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg text-white font-semibold">{course.title}</CardTitle>
            <Badge variant={statusBadgeVariant[course.status]}>
              {statusLabel[course.status]}
            </Badge>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2 mt-2">
            {course.description}
          </p>
        </CardHeader>
      </Link>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm text-slate-300">
          <div>
            <span className="font-semibold text-white">
              {course.enrolledCount}
            </span>
            명 수강
          </div>
          <div>
            <span className="font-semibold text-white">
              {course.assignmentCount}
            </span>
            개 과제
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/courses/${course.courseId}/manage`);
          }}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          과제 관리
        </Button>
      </CardContent>
    </Card>
  );
};
