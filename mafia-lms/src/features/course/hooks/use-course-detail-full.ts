'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CourseDetailFull } from '../dto';

export const useCourseDetailFull = (courseId: string) => {
  return useQuery<CourseDetailFull, Error>({
    queryKey: ['course', 'full', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}/full`);
      return response.data;
    },
    enabled: !!courseId,
  });
};
