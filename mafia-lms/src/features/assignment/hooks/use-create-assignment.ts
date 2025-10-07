'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CreateAssignmentRequest, AssignmentDetail } from '../dto';

export const useCreateAssignment = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<AssignmentDetail, Error, CreateAssignmentRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post(
        `/courses/${courseId}/assignments`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assignments', 'course', courseId],
      });
    },
  });
};
