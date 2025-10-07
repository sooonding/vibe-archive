'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Report, UpdateReportStatusRequest } from '../dto';

const updateReportStatus = async (
  reportId: string,
  data: UpdateReportStatusRequest
): Promise<Report> => {
  const response = await apiClient.patch<Report>(
    `/reports/${reportId}/status`,
    data
  );
  return response.data;
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: UpdateReportStatusRequest;
    }) => updateReportStatus(reportId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({
        queryKey: ['reportDetail', variables.reportId],
      });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
