'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Category, MetadataQueryParams } from '../dto';

const fetchCategories = async (
  queryParams?: MetadataQueryParams
): Promise<Category[]> => {
  const params = new URLSearchParams();

  if (queryParams?.activeOnly) {
    params.append('activeOnly', queryParams.activeOnly);
  }

  const url = `/metadata/categories${params.toString() ? `?${params.toString()}` : ''}`;
  const { data } = await apiClient.get<Category[]>(url);
  return data;
};

export const useCategories = (queryParams?: MetadataQueryParams) => {
  return useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => fetchCategories(queryParams),
  });
};
