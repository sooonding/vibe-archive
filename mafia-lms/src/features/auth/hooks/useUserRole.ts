'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';

export const useUserRole = () => {
  return useQuery<{ role: 'learner' | 'instructor' }, Error>({
    queryKey: ['user', 'role'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/role');
      return response.data;
    },
    staleTime: Infinity,
    retry: false,
  });
};
