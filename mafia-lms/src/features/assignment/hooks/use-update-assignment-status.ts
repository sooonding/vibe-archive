'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { UpdateAssignmentStatusRequest, AssignmentDetail } from '../dto';

export const useUpdateAssignmentStatus = (assignmentId: string, courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<AssignmentDetail, Error, UpdateAssignmentStatusRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.patch(
        `/assignments/${assignmentId}/status`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignments', 'course', courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['assignment', assignmentId],
      });
    },
  });
};
