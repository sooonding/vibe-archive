import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from './schema';
import { authErrorCodes, type AuthServiceError } from './error';

export const signupUser = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, AuthServiceError, unknown>> => {
  const { data: authData, error: authError } = await client.auth.signUp({
    email: request.email,
    password: request.password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return failure(
        400,
        authErrorCodes.emailAlreadyExists,
        '이미 사용 중인 이메일입니다.',
      );
    }
    return failure(500, authErrorCodes.signupFailed, authError.message);
  }

  if (!authData.user) {
    return failure(
      500,
      authErrorCodes.signupFailed,
      '회원가입에 실패했습니다.',
    );
  }

  const userId = authData.user.id;

  const { error: userError } = await client.from('users').insert({
    id: userId,
    email: request.email,
    role: request.role,
  });

  if (userError) {
    return failure(
      500,
      authErrorCodes.profileCreationFailed,
      'users 테이블 생성 실패',
      userError,
    );
  }

  const { error: profileError } = await client.from('profiles').insert({
    user_id: userId,
    name: request.name,
    phone: request.phone,
  });

  if (profileError) {
    return failure(
      500,
      authErrorCodes.profileCreationFailed,
      'profiles 테이블 생성 실패',
      profileError,
    );
  }

  const { error: termsError } = await client.from('terms_acceptance').insert({
    user_id: userId,
  });

  if (termsError) {
    return failure(
      500,
      authErrorCodes.termsAcceptanceFailed,
      'terms_acceptance 테이블 생성 실패',
      termsError,
    );
  }

  const response: SignupResponse = {
    userId,
    email: request.email,
    role: request.role,
  };

  const parsed = SignupResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      authErrorCodes.signupFailed,
      '응답 검증 실패',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};
