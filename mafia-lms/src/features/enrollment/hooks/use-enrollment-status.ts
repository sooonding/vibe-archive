'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { EnrollmentStatusResponse } from '../dto';

const fetchEnrollmentStatus = async (
  courseId: string,
): Promise<EnrollmentStatusResponse> => {
  const { data } = await apiClient.get<EnrollmentStatusResponse>(
    `/enrollments/status/${courseId}`,
  );
  return data;
};

export const useEnrollmentStatus = (courseId: string) => {
  return useQuery({
    queryKey: ['enrollmentStatus', courseId],
    queryFn: () => fetchEnrollmentStatus(courseId),
    enabled: !!courseId,
  });
};
