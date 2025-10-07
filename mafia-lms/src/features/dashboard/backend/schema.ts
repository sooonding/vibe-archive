import { z } from 'zod';
import { UpcomingAssignmentSchema } from '@/features/assignment/backend/schema';
import { FeedbackItemSchema } from '@/features/submission/backend/schema';

export const EnrolledCourseSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string(),
  category: z.string(),
  difficulty: z.string(),
  instructorName: z.string(),
  enrolledAt: z.string(),
  progress: z.number().min(0).max(100),
  totalAssignments: z.number(),
  completedAssignments: z.number(),
});

export const LearnerDashboardResponseSchema = z.object({
  enrolledCourses: z.array(EnrolledCourseSchema),
  upcomingAssignments: z.array(UpcomingAssignmentSchema),
  recentFeedback: z.array(FeedbackItemSchema),
});

export type EnrolledCourse = z.infer<typeof EnrolledCourseSchema>;
export type LearnerDashboardResponse = z.infer<
  typeof LearnerDashboardResponseSchema
>;

export const InstructorCourseSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  enrolledCount: z.number(),
  assignmentCount: z.number(),
});

export const RecentSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  assignmentTitle: z.string(),
  learnerName: z.string(),
  submittedAt: z.string(),
  isLate: z.boolean(),
});

export const InstructorDashboardResponseSchema = z.object({
  courses: z.array(InstructorCourseSchema),
  pendingSubmissionsCount: z.number(),
  recentSubmissions: z.array(RecentSubmissionSchema),
});

export type InstructorCourse = z.infer<typeof InstructorCourseSchema>;
export type RecentSubmission = z.infer<typeof RecentSubmissionSchema>;
export type InstructorDashboardResponse = z.infer<
  typeof InstructorDashboardResponseSchema
>;
