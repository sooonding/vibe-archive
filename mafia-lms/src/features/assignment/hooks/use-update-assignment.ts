'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { UpdateAssignmentRequest, AssignmentDetail } from '../dto';

export const useUpdateAssignment = (assignmentId: string, courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<AssignmentDetail, Error, UpdateAssignmentRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.put(`/assignments/${assignmentId}`, data);
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
