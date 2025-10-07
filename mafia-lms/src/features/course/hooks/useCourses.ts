import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import {
  PublicCoursesResponseSchema,
  type PublicCourse,
  type CourseQueryParams,
} from '../lib/dto';

export const useCourses = (queryParams?: CourseQueryParams) => {
  return useQuery<PublicCourse[], Error>({
    queryKey: ['courses', 'public', queryParams],
    queryFn: async () => {
      const response = await apiClient.get('/courses', { params: queryParams });
      return PublicCoursesResponseSchema.parse(response.data);
    },
  });
};
