'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import type { Category, UpdateCategoryRequest } from '../dto';

const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<Category> => {
  const response = await apiClient.put<Category>(
    `/metadata/categories/${categoryId}`,
    data
  );
  return response.data;
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: UpdateCategoryRequest;
    }) => updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      const message = extractApiErrorMessage(error);
      throw new Error(message);
    },
  });
};
