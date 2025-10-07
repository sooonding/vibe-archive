'use client';

import Link from 'next/link';
import { useAssignmentSubmissions } from '../hooks/use-assignment-submissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format/date';

interface AssignmentSubmissionListProps {
  assignmentId: string;
}

const statusConfig = {
  not_submitted: { label: '미제출', variant: 'secondary' as const },
  submitted: { label: '제출완료', variant: 'default' as const },
  graded: { label: '채점완료', variant: 'default' as const },
  resubmission_required: { label: '재제출 필요', variant: 'destructive' as const },
};

export function AssignmentSubmissionList({
  assignmentId,
}: AssignmentSubmissionListProps) {
  const { data: submissions, isLoading, error } = useAssignmentSubmissions(assignmentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-destructive">제출 내역을 불러오는데 실패했습니다</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">제출 내역이 없습니다</p>
      </div>
    );
  }

  const stats = {
    total: submissions.length,
    submitted: submissions.filter(
      (s) => s.submissionStatus === 'submitted' || s.submissionStatus === 'graded',
    ).length,
    graded: submissions.filter((s) => s.submissionStatus === 'graded').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">전체:</span>
          <span className="font-semibold">{stats.total}명</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">제출:</span>
          <span className="font-semibold">{stats.submitted}명</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">채점완료:</span>
          <span className="font-semibold">{stats.graded}명</span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>학생명</TableHead>
              <TableHead>제출 상태</TableHead>
              <TableHead>제출 시간</TableHead>
              <TableHead>지각 여부</TableHead>
              <TableHead className="text-right">점수</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.learnerId}>
                <TableCell className="font-medium">
                  {submission.learnerName}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[submission.submissionStatus].variant}>
                    {statusConfig[submission.submissionStatus].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {submission.submittedAt
                    ? formatDate(submission.submittedAt)
                    : '-'}
                </TableCell>
                <TableCell>
                  {submission.late !== null ? (
                    submission.late ? (
                      <Badge variant="destructive">지각</Badge>
                    ) : (
                      <Badge variant="secondary">정상</Badge>
                    )
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {submission.score !== null ? `${submission.score}점` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {submission.submissionId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/grades/${submission.submissionId}`}>
                        {submission.submissionStatus === 'graded'
                          ? '상세보기'
                          : '채점하기'}
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
