import { z } from 'zod';

export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  learnerId: z.string().uuid(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  submittedAt: z.string(),
  gradedAt: z.string().nullable(),
});

export const FeedbackItemSchema = z.object({
  assignmentTitle: z.string(),
  courseName: z.string(),
  score: z.number().nullable(),
  feedback: z.string(),
  gradedAt: z.string(),
  isResubmissionRequired: z.boolean(),
});

export const SubmissionHistoryItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  link: z.string().nullable(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  late: z.boolean(),
  submittedAt: z.string(),
  grade: z
    .object({
      score: z.number(),
      feedback: z.string(),
      gradedAt: z.string(),
    })
    .nullable(),
});

export const CreateSubmissionRequestSchema = z.object({
  text: z.string().min(1, '답변을 입력해주세요'),
  link: z
    .string()
    .url('올바른 URL 형식을 입력해주세요')
    .nullable()
    .optional()
    .or(z.literal('')),
});

export type Submission = z.infer<typeof SubmissionSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type SubmissionHistoryItem = z.infer<
  typeof SubmissionHistoryItemSchema
>;
export type CreateSubmissionRequest = z.infer<
  typeof CreateSubmissionRequestSchema
>;
