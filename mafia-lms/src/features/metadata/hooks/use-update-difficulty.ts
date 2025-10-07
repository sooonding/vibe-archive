'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Difficulty, UpdateDifficultyRequest } from '../dto';

const updateDifficulty = async (
  difficultyId: string,
  data: UpdateDifficultyRequest
): Promise<Difficulty> => {
  const response = await apiClient.put<Difficulty>(
    `/metadata/difficulties/${difficultyId}`,
    data
  );
  return response.data;
};

export const useUpdateDifficulty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      difficultyId,
      data,
    }: {
      difficultyId: string;
      data: UpdateDifficultyRequest;
    }) => updateDifficulty(difficultyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['difficulties'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
