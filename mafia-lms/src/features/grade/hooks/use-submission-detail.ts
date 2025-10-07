import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { SubmissionDetail } from '../dto';

export const useSubmissionDetail = (submissionId: string) => {
  return useQuery({
    queryKey: ['submission', submissionId, 'detail'],
    queryFn: async () => {
      const response = await apiClient.get<SubmissionDetail>(
        `/submissions/${submissionId}/detail`,
      );
      return response.data;
    },
    enabled: !!submissionId,
  });
};
