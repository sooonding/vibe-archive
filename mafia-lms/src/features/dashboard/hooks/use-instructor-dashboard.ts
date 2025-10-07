'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { InstructorDashboardResponse } from '../dto';

export const useInstructorDashboard = () => {
  return useQuery<InstructorDashboardResponse, Error>({
    queryKey: ['dashboard', 'instructor'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/instructor');
      return response.data;
    },
  });
};
