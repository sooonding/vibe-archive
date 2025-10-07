import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  EnrollResponseSchema,
  EnrollmentStatusResponseSchema,
  type EnrollResponse,
  type EnrollmentStatusResponse,
} from './schema';
import { enrollmentErrorCodes, type EnrollmentServiceError } from './error';

export const enrollCourse = async (
  client: SupabaseClient,
  learnerId: string,
  courseId: string,
): Promise<HandlerResult<EnrollResponse, EnrollmentServiceError, unknown>> => {
  const { data: user, error: userError } = await client
    .from('users')
    .select('role')
    .eq('id', learnerId)
    .single();

  if (userError || !user) {
    return failure(
      500,
      enrollmentErrorCodes.enrollmentFailed,
      'Failed to fetch user',
    );
  }

  if (user.role !== 'learner') {
    return failure(
      400,
      enrollmentErrorCodes.invalidRole,
      '학습자 계정으로만 수강신청할 수 있습니다.',
    );
  }

  const { data: course, error: courseError } = await client
    .from('courses')
    .select('status')
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return failure(
      404,
      enrollmentErrorCodes.courseNotFound,
      'Course not found',
    );
  }

  if (course.status !== 'published') {
    return failure(
      400,
      enrollmentErrorCodes.courseNotPublished,
      '현재 수강신청이 불가능한 코스입니다.',
    );
  }

  const { data: existing } = await client
    .from('enrollments')
    .select('*')
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return failure(
      400,
      enrollmentErrorCodes.alreadyEnrolled,
      '이미 수강 중인 코스입니다.',
    );
  }

  const { data: enrollment, error: enrollError } = await client
    .from('enrollments')
    .insert({
      learner_id: learnerId,
      course_id: courseId,
    })
    .select('learner_id, course_id, enrolled_at')
    .single();

  if (enrollError || !enrollment) {
    return failure(
      500,
      enrollmentErrorCodes.enrollmentFailed,
      'Enrollment failed',
      enrollError,
    );
  }

  const response: EnrollResponse = {
    learnerId: enrollment.learner_id,
    courseId: enrollment.course_id,
    enrolledAt: enrollment.enrolled_at,
  };

  const parsed = EnrollResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      enrollmentErrorCodes.enrollmentFailed,
      'Response validation failed',
      parsed.error.format(),
    );
  }

  return success(parsed.data, 201);
};

export const unenrollCourse = async (
  client: SupabaseClient,
  learnerId: string,
  courseId: string,
): Promise<HandlerResult<void, EnrollmentServiceError, unknown>> => {
  const { data: existing } = await client
    .from('enrollments')
    .select('*')
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
    .single();

  if (!existing) {
    return failure(
      400,
      enrollmentErrorCodes.notEnrolled,
      '수강 중인 코스가 아닙니다.',
    );
  }

  const { error: deleteError } = await client
    .from('enrollments')
    .delete()
    .eq('learner_id', learnerId)
    .eq('course_id', courseId);

  if (deleteError) {
    return failure(
      500,
      enrollmentErrorCodes.unenrollmentFailed,
      'Unenrollment failed',
      deleteError,
    );
  }

  return success(undefined, 200);
};

export const checkEnrollment = async (
  client: SupabaseClient,
  learnerId: string,
  courseId: string,
): Promise<
  HandlerResult<EnrollmentStatusResponse, EnrollmentServiceError, unknown>
> => {
  const { data: enrollment } = await client
    .from('enrollments')
    .select('enrolled_at')
    .eq('learner_id', learnerId)
    .eq('course_id', courseId)
    .single();

  const response: EnrollmentStatusResponse = {
    isEnrolled: !!enrollment,
    enrolledAt: enrollment?.enrolled_at ?? null,
  };

  const parsed = EnrollmentStatusResponseSchema.safeParse(response);

  if (!parsed.success) {
    return failure(
      500,
      enrollmentErrorCodes.enrollmentFailed,
      'Response validation failed',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};
