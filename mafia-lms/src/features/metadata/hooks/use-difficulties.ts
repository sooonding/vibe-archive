'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import type { Difficulty, MetadataQueryParams } from '../dto';

const fetchDifficulties = async (
  queryParams?: MetadataQueryParams
): Promise<Difficulty[]> => {
  const params = new URLSearchParams();

  if (queryParams?.activeOnly) {
    params.append('activeOnly', queryParams.activeOnly);
  }

  const url = `/metadata/difficulties${params.toString() ? `?${params.toString()}` : ''}`;
  const { data } = await apiClient.get<Difficulty[]>(url);
  return data;
};

export const useDifficulties = (queryParams?: MetadataQueryParams) => {
  return useQuery({
    queryKey: ['difficulties', queryParams],
    queryFn: () => fetchDifficulties(queryParams),
  });
};
