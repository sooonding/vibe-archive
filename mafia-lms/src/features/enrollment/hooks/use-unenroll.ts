'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';

const unenrollCourse = async (courseId: string): Promise<void> => {
  await apiClient.delete(`/enrollments/${courseId}`);
};

export const useUnenroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unenrollCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollmentStatus'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(
        error,
        '수강취소에 실패했습니다. 다시 시도해주세요.',
      );
      throw new Error(message);
    },
  });
};
