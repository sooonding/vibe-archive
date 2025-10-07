'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CreateCourseRequest, CourseDetailFull } from '../dto';

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<CourseDetailFull, Error, CreateCourseRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['instructor', 'courses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['instructor', 'dashboard'],
      });
    },
  });
};
