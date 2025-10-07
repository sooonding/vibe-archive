import { z } from 'zod';

export const AssignmentGradeSchema = z.object({
  assignmentId: z.string().uuid(),
  assignmentTitle: z.string(),
  weight: z.number(),
  submissionStatus: z.enum([
    'not_submitted',
    'submitted',
    'graded',
    'resubmission_required',
  ]),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  late: z.boolean(),
  submittedAt: z.string().nullable(),
  gradedAt: z.string().nullable(),
});

export const CourseGradeSchema = z.object({
  courseId: z.string().uuid(),
  courseName: z.string(),
  totalScore: z.number(),
  maxScore: z.number(),
  assignments: z.array(AssignmentGradeSchema),
});

export const MyGradesResponseSchema = z.object({
  courses: z.array(CourseGradeSchema),
});

export const SubmissionDetailSchema = z.object({
  submissionId: z.string().uuid(),
  assignmentTitle: z.string(),
  courseId: z.string().uuid(),
  courseName: z.string(),
  learnerId: z.string().uuid(),
  learnerName: z.string(),
  submissionText: z.string(),
  submissionLink: z.string().nullable(),
  submittedAt: z.string(),
  isLate: z.boolean(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  currentScore: z.number().nullable(),
  currentFeedback: z.string().nullable(),
  gradedAt: z.string().nullable(),
});

export const GradeSubmissionRequestSchema = z.object({
  score: z.number().min(0).max(100, '점수는 0~100 사이여야 합니다'),
  feedback: z.string().min(1, '피드백은 필수입니다'),
});

export const GradeSubmissionResponseSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['graded']),
  score: z.number(),
  feedback: z.string(),
  gradedAt: z.string(),
});

export const RequestResubmissionRequestSchema = z.object({
  feedback: z.string().min(1, '재제출 사유는 필수입니다'),
});

export type AssignmentGrade = z.infer<typeof AssignmentGradeSchema>;
export type CourseGrade = z.infer<typeof CourseGradeSchema>;
export type MyGradesResponse = z.infer<typeof MyGradesResponseSchema>;
export type SubmissionDetail = z.infer<typeof SubmissionDetailSchema>;
export type GradeSubmissionRequest = z.infer<
  typeof GradeSubmissionRequestSchema
>;
export type GradeSubmissionResponse = z.infer<
  typeof GradeSubmissionResponseSchema
>;
export type RequestResubmissionRequest = z.infer<
  typeof RequestResubmissionRequestSchema
>;
