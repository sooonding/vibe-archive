import { z } from 'zod';

export const AssignmentSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string(),
  dueDate: z.string(),
  status: z.enum(['draft', 'published', 'closed']),
});

export const UpcomingAssignmentSchema = AssignmentSchema.extend({
  courseName: z.string(),
  dueInHours: z.number(),
  submissionStatus: z.enum(['not_submitted', 'resubmission_required']),
});

export const AssignmentDetailSchema = AssignmentSchema.extend({
  description: z.string(),
  weight: z.number(),
  allowLate: z.boolean(),
  allowResubmission: z.boolean(),
  courseName: z.string(),
});

export const CourseAssignmentSchema = AssignmentSchema.extend({
  submissionStatus: z.enum([
    'not_submitted',
    'submitted',
    'graded',
    'resubmission_required',
  ]),
});

export const CourseAssignmentsResponseSchema = z.array(CourseAssignmentSchema);

export const CreateAssignmentRequestSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  description: z.string().min(1, '설명을 입력해주세요'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: '올바른 날짜 형식이 아닙니다',
  }),
  weight: z.number().min(0).max(100, '점수 비중은 0~100 사이여야 합니다'),
  allowLate: z.boolean().default(false),
  allowResubmission: z.boolean().default(false),
});

export const UpdateAssignmentRequestSchema =
  CreateAssignmentRequestSchema.partial();

export const UpdateAssignmentStatusRequestSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']),
});

export const SubmissionListItemSchema = z.object({
  submissionId: z.string().uuid().nullable(),
  learnerId: z.string().uuid(),
  learnerName: z.string(),
  submissionStatus: z.enum([
    'not_submitted',
    'submitted',
    'graded',
    'resubmission_required',
  ]),
  submittedAt: z.string().nullable(),
  late: z.boolean().nullable(),
  score: z.number().nullable(),
});

export const AssignmentSubmissionsResponseSchema = z.array(
  SubmissionListItemSchema,
);

export type Assignment = z.infer<typeof AssignmentSchema>;
export type UpcomingAssignment = z.infer<typeof UpcomingAssignmentSchema>;
export type AssignmentDetail = z.infer<typeof AssignmentDetailSchema>;
export type CourseAssignment = z.infer<typeof CourseAssignmentSchema>;
export type CreateAssignmentRequest = z.infer<
  typeof CreateAssignmentRequestSchema
>;
export type UpdateAssignmentRequest = z.infer<
  typeof UpdateAssignmentRequestSchema
>;
export type UpdateAssignmentStatusRequest = z.infer<
  typeof UpdateAssignmentStatusRequestSchema
>;
export type SubmissionListItem = z.infer<typeof SubmissionListItemSchema>;
