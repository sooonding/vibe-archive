import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from '../lib/dto';

export const useSignup = () => {
  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: async (request: SignupRequest) => {
      const response = await apiClient.post('/auth/signup', request);
      return SignupResponseSchema.parse(response.data);
    },
  });
};
