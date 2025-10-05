'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import {
  SignupRequestSchema,
  SignupResponseSchema,
  type SignupRequest,
} from '../lib/dto';

const postSignup = async (request: SignupRequest) => {
  try {
    const validated = SignupRequestSchema.parse(request);
    const { data } = await apiClient.post('/auth/signup', validated);
    return SignupResponseSchema.parse(data);
  } catch (error) {
    const message = extractApiErrorMessage(error, '회원가입에 실패했습니다');
    throw new Error(message);
  }
};

export const useSignupMutation = () =>
  useMutation({
    mutationFn: postSignup,
  });
