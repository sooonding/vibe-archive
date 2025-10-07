'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SubmissionHistoryItem } from '../dto';

export const useSubmissionHistory = (assignmentId: string) => {
  return useQuery<SubmissionHistoryItem[], Error>({
    queryKey: ['submissions', 'history', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/assignments/${assignmentId}/submissions`,
      );
      return response.data;
    },
    enabled: !!assignmentId,
  });
};
