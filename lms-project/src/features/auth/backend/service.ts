import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import type { SignupRequest, SignupResponse } from './schema';
import { authErrorCodes, type AuthServiceError } from './error';

export const signup = async (
  client: SupabaseClient,
  request: SignupRequest,
): Promise<HandlerResult<SignupResponse, AuthServiceError, unknown>> => {
  const { data: existingUser } = await client.auth.admin.listUsers();
  const emailExists = existingUser?.users.some(
    (u) => u.email === request.email,
  );

  if (emailExists) {
    return failure(
      409,
      authErrorCodes.emailAlreadyExists,
      '이미 사용중인 이메일입니다',
    );
  }

  const { data: authData, error: authError } =
    await client.auth.admin.createUser({
      email: request.email,
      password: request.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return failure(
      500,
      authErrorCodes.signupFailed,
      authError?.message ?? '회원가입에 실패했습니다',
    );
  }

  const userId = authData.user.id;

  const { error: profileError } = await client.from('profiles').insert({
    id: userId,
    role: request.role,
    name: request.name,
    phone: request.phone,
  });

  if (profileError) {
    await client.auth.admin.deleteUser(userId);
    return failure(
      500,
      authErrorCodes.profileCreationFailed,
      '프로필 생성에 실패했습니다',
    );
  }

  const { error: termsError } = await client.from('terms_agreements').insert({
    user_id: userId,
  });

  if (termsError) {
    await client.from('profiles').delete().eq('id', userId);
    await client.auth.admin.deleteUser(userId);
    return failure(
      500,
      authErrorCodes.termsAgreementFailed,
      '약관 동의 저장에 실패했습니다',
    );
  }

  return success(
    {
      user: {
        id: userId,
        email: request.email,
        role: request.role,
        name: request.name,
      },
      token: userId,
    },
    201,
  );
};
