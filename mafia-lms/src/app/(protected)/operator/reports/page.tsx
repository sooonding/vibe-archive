'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useReports } from '@/features/report/hooks/use-reports';
import { useUpdateReportStatus } from '@/features/report/hooks/use-update-report-status';
import { useExecuteAction } from '@/features/report/hooks/use-execute-action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/format/date';
import type { Report } from '@/features/report/dto';

const statusColors = {
  received: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

const statusLabels = {
  received: '접수됨',
  investigating: '조사 중',
  resolved: '처리 완료',
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { data: reports, isLoading } = useReports();
  const updateStatus = useUpdateReportStatus();
  const executeAction = useExecuteAction();

  const handleStatusChange = async (reportId: string, status: 'investigating' | 'resolved') => {
    try {
      await updateStatus.mutateAsync({ reportId, data: { status } });
    } catch (error) {
      console.error(error);
    }
  };

  const handleExecuteAction = async (
    reportId: string,
    action: 'warn' | 'invalidate_submission' | 'suspend_user' | 'archive_course',
    reason: string
  ) => {
    try {
      await executeAction.mutateAsync({ reportId, data: { action, reason } });
      setSelectedReport(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>신고 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>대상 타입</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.targetType}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[report.status]}>
                      {statusLabels[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      상세
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>신고 상세</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">대상 타입</p>
                <p className="text-sm text-muted-foreground">{selectedReport.targetType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">사유</p>
                <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium">내용</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.content || '내용 없음'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">상태</p>
                <Badge className={statusColors[selectedReport.status]}>
                  {statusLabels[selectedReport.status]}
                </Badge>
              </div>
              {selectedReport.status !== 'resolved' && (
                <div className="flex gap-2">
                  {selectedReport.status === 'received' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(selectedReport.id, 'investigating')}
                    >
                      조사 시작
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleExecuteAction(
                        selectedReport.id,
                        'warn',
                        'Policy violation'
                      )
                    }
                  >
                    경고 발송
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
