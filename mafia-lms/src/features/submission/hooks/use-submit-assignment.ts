import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CreateSubmissionRequest } from '../dto';

export const useSubmitAssignment = (assignmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubmissionRequest) => {
      const response = await apiClient.post(
        `/assignments/${assignmentId}/submissions`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate submission history for learner
      queryClient.invalidateQueries({
        queryKey: ['submissions', 'history', assignmentId],
      });
      // Invalidate assignment detail
      queryClient.invalidateQueries({
        queryKey: ['assignment', assignmentId],
      });
      // Invalidate instructor's submission list
      queryClient.invalidateQueries({
        queryKey: ['assignment', assignmentId, 'submissions'],
      });
      // Invalidate dashboard queries
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
    },
  });
};
