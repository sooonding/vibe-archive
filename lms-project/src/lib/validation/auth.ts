import { z } from 'zod';

export const emailSchema = z
  .string()
  .email({ message: '올바른 이메일 주소를 입력하세요' });

export const passwordSchema = z
  .string()
  .min(8, { message: '비밀번호는 8자 이상이어야 합니다' });

export const phoneSchema = z
  .string()
  .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, {
    message: '올바른 휴대폰번호를 입력하세요',
  });

export const nameSchema = z
  .string()
  .min(1, { message: '이름을 입력하세요' })
  .max(100);
