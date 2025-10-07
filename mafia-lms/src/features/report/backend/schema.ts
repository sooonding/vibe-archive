import { z } from 'zod';

export const ReportSchema = z.object({
  id: z.string().uuid(),
  targetType: z.enum(['course', 'assignment', 'submission', 'user']),
  targetId: z.string().uuid(),
  reporterId: z.string().uuid(),
  reason: z.enum(['inappropriate', 'plagiarism', 'spam', 'other']),
  content: z.string().nullable(),
  status: z.enum(['received', 'investigating', 'resolved']),
  actionTaken: z.string().nullable(),
  actionReason: z.string().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});

export type Report = z.infer<typeof ReportSchema>;

export const ReportQueryParamsSchema = z.object({
  status: z.enum(['received', 'investigating', 'resolved']).optional(),
  targetType: z
    .enum(['course', 'assignment', 'submission', 'user'])
    .optional(),
});

export type ReportQueryParams = z.infer<typeof ReportQueryParamsSchema>;

export const UpdateReportStatusSchema = z.object({
  status: z.enum(['investigating', 'resolved']),
});

export type UpdateReportStatusRequest = z.infer<
  typeof UpdateReportStatusSchema
>;

export const ExecuteActionSchema = z.object({
  action: z.enum([
    'warn',
    'invalidate_submission',
    'suspend_user',
    'archive_course',
  ]),
  reason: z.string().min(10, '사유는 최소 10자 이상 입력해주세요'),
});

export type ExecuteActionRequest = z.infer<typeof ExecuteActionSchema>;

export const ReportDetailParamsSchema = z.object({
  id: z.string().uuid({ message: 'Report ID must be a valid UUID.' }),
});

export type ReportDetailParams = z.infer<typeof ReportDetailParamsSchema>;
