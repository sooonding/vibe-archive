'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Difficulty } from '../dto';

const toggleDifficulty = async (difficultyId: string): Promise<Difficulty> => {
  const response = await apiClient.patch<Difficulty>(
    `/metadata/difficulties/${difficultyId}/toggle`,
    {}
  );
  return response.data;
};

export const useToggleDifficulty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDifficulty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficulties'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
