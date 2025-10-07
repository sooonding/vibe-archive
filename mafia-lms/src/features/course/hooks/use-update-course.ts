'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { UpdateCourseRequest, CourseDetailFull } from '../dto';

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation<CourseDetailFull, Error, UpdateCourseRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.put(`/courses/${courseId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course', 'full', courseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['instructor', 'courses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['instructor', 'dashboard'],
      });
    },
  });
};
