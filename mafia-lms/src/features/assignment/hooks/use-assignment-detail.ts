'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { AssignmentDetail } from '../dto';

export const useAssignmentDetail = (assignmentId: string) => {
  return useQuery<AssignmentDetail, Error>({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data;
    },
    enabled: !!assignmentId,
  });
};
