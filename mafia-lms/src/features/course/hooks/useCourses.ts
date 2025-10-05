import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import {
  PublicCoursesResponseSchema,
  type PublicCourse,
} from '../lib/dto';

export const useCourses = () => {
  return useQuery<PublicCourse[], Error>({
    queryKey: ['courses', 'public'],
    queryFn: async () => {
      const response = await apiClient.get('/courses');
      return PublicCoursesResponseSchema.parse(response.data);
    },
  });
};
