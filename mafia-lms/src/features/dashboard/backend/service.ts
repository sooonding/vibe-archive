import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { dashboardErrorCodes, type DashboardServiceError } from './error';
import type {
  EnrolledCourse,
  LearnerDashboardResponse,
  InstructorDashboardResponse,
} from './schema';
import { getUpcomingAssignments } from '@/features/assignment/backend/service';
import {
  getRecentFeedback,
  getCourseProgress,
  getPendingSubmissionsCount,
  getRecentSubmissions,
} from '@/features/submission/backend/service';
import { calculateProgress } from '@/lib/utils/progress';
import { getInstructorCourses } from '@/features/course/backend/service';

export const getLearnerDashboard = async (
  client: SupabaseClient,
  learnerId: string,
): Promise<
  HandlerResult<LearnerDashboardResponse, DashboardServiceError, unknown>
> => {
  try {
    // 1. Check user role
    const { data: user, error: userError } = await client
      .from('users')
      .select('role')
      .eq('id', learnerId)
      .single();

    if (userError) {
      return failure(500, dashboardErrorCodes.fetchError, userError.message);
    }

    if (user.role !== 'learner') {
      return failure(
        403,
        dashboardErrorCodes.invalidRole,
        'Only learners can access this dashboard',
      );
    }

    // 2. Get enrolled courses
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select(
        `
        enrolled_at,
        course_id,
        courses!inner (
          id,
          title,
          category,
          difficulty,
          instructor_id
        )
      `,
      )
      .eq('learner_id', learnerId);

    if (enrollmentError) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        enrollmentError.message,
      );
    }

    const enrolledCourses: EnrolledCourse[] = [];

    if (enrollments && enrollments.length > 0) {
      for (const enrollment of enrollments) {
        const course = enrollment.courses as any;

        // Get instructor name
        const { data: instructorProfile } = await client
          .from('profiles')
          .select('name')
          .eq('user_id', course.instructor_id)
          .single();

        // Get course progress
        const progressResult = await getCourseProgress(
          client,
          learnerId,
          course.id,
        );

        if (!progressResult.ok) {
          continue;
        }

        const { total, completed } = progressResult.data;
        const progress = calculateProgress(completed, total);

        enrolledCourses.push({
          courseId: course.id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          instructorName: instructorProfile?.name || 'Unknown Instructor',
          enrolledAt: enrollment.enrolled_at,
          progress,
          totalAssignments: total,
          completedAssignments: completed,
        });
      }
    }

    // 3. Get upcoming assignments
    const upcomingAssignmentsResult = await getUpcomingAssignments(
      client,
      learnerId,
    );

    if (!upcomingAssignmentsResult.ok) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        'Failed to fetch upcoming assignments',
      );
    }

    // 4. Get recent feedback
    const recentFeedbackResult = await getRecentFeedback(client, learnerId);

    if (!recentFeedbackResult.ok) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        'Failed to fetch recent feedback',
      );
    }

    return success({
      enrolledCourses,
      upcomingAssignments: upcomingAssignmentsResult.data,
      recentFeedback: recentFeedbackResult.data,
    });
  } catch (error) {
    return failure(
      500,
      dashboardErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getInstructorDashboard = async (
  client: SupabaseClient,
  instructorId: string,
): Promise<
  HandlerResult<InstructorDashboardResponse, DashboardServiceError, unknown>
> => {
  try {
    const { data: user, error: userError } = await client
      .from('users')
      .select('role')
      .eq('id', instructorId)
      .single();

    if (userError) {
      return failure(500, dashboardErrorCodes.fetchError, userError.message);
    }

    if (user.role !== 'instructor') {
      return failure(
        403,
        dashboardErrorCodes.invalidRole,
        'Only instructors can access this dashboard',
      );
    }

    const coursesResult = await getInstructorCourses(client, instructorId);

    if (!coursesResult.ok) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        'Failed to fetch instructor courses',
      );
    }

    const pendingCountResult = await getPendingSubmissionsCount(
      client,
      instructorId,
    );

    if (!pendingCountResult.ok) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        'Failed to fetch pending submissions count',
      );
    }

    const recentSubmissionsResult = await getRecentSubmissions(
      client,
      instructorId,
      5,
    );

    if (!recentSubmissionsResult.ok) {
      return failure(
        500,
        dashboardErrorCodes.fetchError,
        'Failed to fetch recent submissions',
      );
    }

    return success({
      courses: coursesResult.data,
      pendingSubmissionsCount: pendingCountResult.data,
      recentSubmissions: recentSubmissionsResult.data,
    });
  } catch (error) {
    return failure(
      500,
      dashboardErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};
