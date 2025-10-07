'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Category } from '../dto';

const toggleCategory = async (categoryId: string): Promise<Category> => {
  const response = await apiClient.patch<Category>(
    `/metadata/categories/${categoryId}/toggle`,
    {}
  );
  return response.data;
};

export const useToggleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
