import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { MyGradesResponse } from '../dto';

export const useMyGrades = () => {
  return useQuery({
    queryKey: ['grades', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<MyGradesResponse>('/grades/my');
      return response.data;
    },
  });
};
