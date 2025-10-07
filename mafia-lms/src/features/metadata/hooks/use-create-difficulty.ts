'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Difficulty, CreateDifficultyRequest } from '../dto';

const createDifficulty = async (
  data: CreateDifficultyRequest
): Promise<Difficulty> => {
  const response = await apiClient.post<Difficulty>(
    '/metadata/difficulties',
    data
  );
  return response.data;
};

export const useCreateDifficulty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDifficulty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficulties'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
