'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CourseAssignment } from '../dto';

export const useAssignments = (courseId: string) => {
  return useQuery<CourseAssignment[], Error>({
    queryKey: ['assignments', 'course', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${courseId}/assignments`);
      return response.data;
    },
    enabled: !!courseId,
  });
};
