'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Report } from '../dto';

const fetchReportDetail = async (reportId: string): Promise<Report> => {
  const { data } = await apiClient.get<Report>(`/reports/${reportId}`);
  return data;
};

export const useReportDetail = (reportId: string) => {
  return useQuery({
    queryKey: ['reportDetail', reportId],
    queryFn: () => fetchReportDetail(reportId),
    enabled: !!reportId,
  });
};
