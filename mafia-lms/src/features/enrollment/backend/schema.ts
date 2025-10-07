import { z } from 'zod';

export const EnrollRequestSchema = z.object({
  courseId: z.string().uuid({ message: 'Course ID must be a valid UUID.' }),
});

export type EnrollRequest = z.infer<typeof EnrollRequestSchema>;

export const EnrollResponseSchema = z.object({
  learnerId: z.string().uuid(),
  courseId: z.string().uuid(),
  enrolledAt: z.string(),
});

export type EnrollResponse = z.infer<typeof EnrollResponseSchema>;

export const UnenrollParamsSchema = z.object({
  courseId: z.string().uuid({ message: 'Course ID must be a valid UUID.' }),
});

export type UnenrollParams = z.infer<typeof UnenrollParamsSchema>;

export const EnrollmentStatusParamsSchema = z.object({
  courseId: z.string().uuid({ message: 'Course ID must be a valid UUID.' }),
});

export type EnrollmentStatusParams = z.infer<typeof EnrollmentStatusParamsSchema>;

export const EnrollmentStatusResponseSchema = z.object({
  isEnrolled: z.boolean(),
  enrolledAt: z.string().nullable(),
});

export type EnrollmentStatusResponse = z.infer<
  typeof EnrollmentStatusResponseSchema
>;
