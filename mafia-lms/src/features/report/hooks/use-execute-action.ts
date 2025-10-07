'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Report, ExecuteActionRequest } from '../dto';

const executeAction = async (
  reportId: string,
  data: ExecuteActionRequest
): Promise<Report> => {
  const response = await apiClient.post<Report>(
    `/reports/${reportId}/action`,
    data
  );
  return response.data;
};

export const useExecuteAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      data,
    }: {
      reportId: string;
      data: ExecuteActionRequest;
    }) => executeAction(reportId, data),
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
