'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SubmissionListItem } from '../dto';

export const useAssignmentSubmissions = (assignmentId: string) => {
  return useQuery<SubmissionListItem[], Error>({
    queryKey: ['assignment', assignmentId, 'submissions'],
    queryFn: async () => {
      const response = await apiClient.get(
        `/assignments/${assignmentId}/instructor/submissions`,
      );
      return response.data;
    },
    enabled: !!assignmentId,
  });
};
