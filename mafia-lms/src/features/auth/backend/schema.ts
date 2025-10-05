import { z } from 'zod';

export const SignupRequestSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
  role: z.enum(['learner', 'instructor'], {
    errorMap: () => ({ message: '역할을 선택해주세요.' }),
  }),
  name: z.string().min(1, { message: '이름을 입력해주세요.' }),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, { message: '올바른 휴대폰번호 형식이 아닙니다.' }),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, { message: '약관에 동의해야 가입할 수 있습니다.' }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['learner', 'instructor']),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;
