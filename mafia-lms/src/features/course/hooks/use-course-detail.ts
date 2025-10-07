'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { CourseDetail } from '../dto';

const fetchCourseDetail = async (courseId: string): Promise<CourseDetail> => {
  const { data } = await apiClient.get<CourseDetail>(
    `/courses/${courseId}`,
  );
  return data;
};

export const useCourseDetail = (courseId: string) => {
  return useQuery({
    queryKey: ['courseDetail', courseId],
    queryFn: () => fetchCourseDetail(courseId),
    enabled: !!courseId,
  });
};
