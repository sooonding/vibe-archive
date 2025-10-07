'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Report, ReportQueryParams } from '../dto';

const fetchReports = async (queryParams?: ReportQueryParams): Promise<Report[]> => {
  const params = new URLSearchParams();

  if (queryParams?.status) {
    params.append('status', queryParams.status);
  }

  if (queryParams?.targetType) {
    params.append('targetType', queryParams.targetType);
  }

  const url = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
  const { data } = await apiClient.get<Report[]>(url);
  return data;
};

export const useReports = (queryParams?: ReportQueryParams) => {
  return useQuery({
    queryKey: ['reports', queryParams],
    queryFn: () => fetchReports(queryParams),
  });
};
