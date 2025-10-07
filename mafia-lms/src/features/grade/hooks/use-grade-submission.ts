import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type {
  GradeSubmissionRequest,
  GradeSubmissionResponse,
} from '../dto';

type GradeSubmissionParams =
  | GradeSubmissionRequest
  | { resubmit: true; feedback: string };

export const useGradeSubmission = (submissionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GradeSubmissionParams) => {
      if ('resubmit' in data) {
        const response = await apiClient.patch<GradeSubmissionResponse>(
          `/submissions/${submissionId}/resubmit`,
          { feedback: data.feedback },
        );
        return response.data;
      }

      const response = await apiClient.post<GradeSubmissionResponse>(
        `/submissions/${submissionId}/grade`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['submission', submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });
};
