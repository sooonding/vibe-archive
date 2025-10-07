'use client';

import { use, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useAssignments } from '@/features/assignment/hooks/use-assignments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format/date';
import { AssignmentFormDialog } from '@/features/assignment/components/assignment-form-dialog';
import { AssignmentActionMenu } from '@/features/assignment/components/assignment-action-menu';

interface InstructorAssignmentsPageProps {
  params: Promise<{ id: string }>;
}

const statusConfig = {
  draft: { label: '임시저장', variant: 'secondary' as const },
  published: { label: '공개', variant: 'default' as const },
  closed: { label: '마감', variant: 'destructive' as const },
};

export default function InstructorAssignmentsPage({
  params,
}: InstructorAssignmentsPageProps) {
  const { id } = use(params);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: assignments, isLoading, error } = useAssignments(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">에러 발생</h2>
          <p className="text-red-400">
            {error.message || '과제 목록을 불러오는데 실패했습니다.'}
          </p>
        </div>
      </div>
    );
  }

  const stats = {
    total: assignments?.length || 0,
    draft: assignments?.filter((a) => a.status === 'draft').length || 0,
    published: assignments?.filter((a) => a.status === 'published').length || 0,
    closed: assignments?.filter((a) => a.status === 'closed').length || 0,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">과제 관리</h1>
            <p className="text-slate-300">
              전체 {stats.total}개 (임시저장 {stats.draft}개, 공개{' '}
              {stats.published}개, 마감 {stats.closed}개)
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            새 과제 만들기
          </Button>
        </header>

        <div className="space-y-4">
          {!assignments || assignments.length === 0 ? (
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="py-12 text-center">
                <p className="text-slate-300 mb-4">아직 과제가 없습니다</p>
                <Button
                  variant="outline"
                  className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 과제 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="bg-slate-800 border-slate-600 hover:bg-slate-750 transition-colors"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl text-white">
                        {assignment.title}
                      </CardTitle>
                      <Badge variant={statusConfig[assignment.status].variant}>
                        {statusConfig[assignment.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      <span>마감: {formatDate(assignment.dueDate)}</span>
                    </div>
                  </div>
                  <AssignmentActionMenu
                    assignment={assignment}
                    courseId={id}
                  />
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        <AssignmentFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          courseId={id}
        />
      </div>
    </main>
  );
}
