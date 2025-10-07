'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { EnrollRequest, EnrollResponse } from '../dto';

const enrollCourse = async (request: EnrollRequest): Promise<EnrollResponse> => {
  const { data } = await apiClient.post<{ data: EnrollResponse }>(
    '/enrollments',
    request,
  );
  return data.data;
};

export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollmentStatus'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        '수강신청에 실패했습니다. 다시 시도해주세요.',
      );
      throw new Error(message);
    },
  });
};
