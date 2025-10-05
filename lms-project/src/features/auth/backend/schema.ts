import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
} from '@/lib/validation/auth';
import { UserRole } from '@/types/user';

export const SignupRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.enum([UserRole.LEARNER, UserRole.INSTRUCTOR]),
  name: nameSchema,
  phone: phoneSchema,
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: '약관에 동의해야 합니다' }),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum([UserRole.LEARNER, UserRole.INSTRUCTOR]),
    name: z.string(),
  }),
  token: z.string(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum([UserRole.LEARNER, UserRole.INSTRUCTOR]),
  name: z.string(),
  phone: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileTableRowSchema>;
