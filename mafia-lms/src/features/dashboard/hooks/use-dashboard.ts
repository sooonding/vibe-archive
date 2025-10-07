'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { LearnerDashboardResponse } from '../dto';

interface UseDashboardOptions {
  enabled?: boolean;
}

export const useDashboard = (options?: UseDashboardOptions) => {
  return useQuery<LearnerDashboardResponse, Error>({
    queryKey: ['dashboard', 'learner'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/learner');
        return response.data;
      } catch (error) {
        const message = extractApiErrorMessage(error);
        throw new Error(message);
      }
    },
    enabled: options?.enabled ?? true,
    retry: false,
  });
};
