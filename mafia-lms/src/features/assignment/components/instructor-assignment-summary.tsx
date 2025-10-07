'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssignmentStatusBadge } from './assignment-status-badge';
import { formatRelativeTime } from '@/lib/format/date';
import type { CourseAssignment } from '../dto';

interface InstructorAssignmentSummaryProps {
  assignments: CourseAssignment[];
  courseId: string;
}

export function InstructorAssignmentSummary({
  assignments,
  courseId,
}: InstructorAssignmentSummaryProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="mb-4">아직 생성된 과제가 없습니다.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/courses/${courseId}/manage`}>과제 만들기</Link>
        </Button>
      </div>
    );
  }

  // Show only first 5 assignments
  const displayAssignments = assignments.slice(0, 5);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700">
            <TableHead className="text-white">제목</TableHead>
            <TableHead className="text-white">상태</TableHead>
            <TableHead className="text-white">마감일</TableHead>
            <TableHead className="text-white text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayAssignments.map((assignment) => (
            <TableRow key={assignment.id} className="border-slate-700">
              <TableCell className="text-white font-medium">
                <Link
                  href={`/assignments/${assignment.id}`}
                  className="hover:text-blue-400 transition-colors"
                >
                  {assignment.title}
                </Link>
              </TableCell>
              <TableCell>
                <AssignmentStatusBadge status={assignment.status} />
              </TableCell>
              <TableCell className="text-slate-300">
                {formatRelativeTime(assignment.dueDate)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm" className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
                  <Link href={`/assignments/${assignment.id}/submissions`}>
                    제출 현황
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {assignments.length > 5 && (
        <div className="text-center">
          <Button asChild variant="outline" className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
            <Link href={`/courses/${courseId}/manage`}>
              전체 과제 보기 ({assignments.length}개)
            </Link>
          </Button>
        </div>
      )}

      {assignments.length <= 5 && (
        <div className="text-center">
          <Button asChild variant="outline" className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
            <Link href={`/courses/${courseId}/manage`}>
              과제 관리
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
