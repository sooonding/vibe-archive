import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  EnrollRequestSchema,
  UnenrollParamsSchema,
  EnrollmentStatusParamsSchema,
} from './schema';
import { enrollCourse, unenrollCourse, checkEnrollment } from './service';
import {
  enrollmentErrorCodes,
  type EnrollmentServiceError,
} from './error';

export const registerEnrollmentRoutes = (app: Hono<AppEnv>) => {
  app.post('/enrollments', async (c) => {
    const parsedBody = EnrollRequestSchema.safeParse(await c.req.json());

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_ENROLL_REQUEST',
          'The provided enrollment request is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in to enroll.'),
      );
    }

    const result = await enrollCourse(
      supabase,
      user.id,
      parsedBody.data.courseId,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<EnrollmentServiceError, unknown>;

      if (errorResult.error.code === enrollmentErrorCodes.enrollmentFailed) {
        logger.error('Failed to enroll in course', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.delete('/enrollments/:courseId', async (c) => {
    const parsedParams = UnenrollParamsSchema.safeParse({
      courseId: c.req.param('courseId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UNENROLL_PARAMS',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in to unenroll.'),
      );
    }

    const result = await unenrollCourse(
      supabase,
      user.id,
      parsedParams.data.courseId,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<EnrollmentServiceError, unknown>;

      if (errorResult.error.code === enrollmentErrorCodes.unenrollmentFailed) {
        logger.error('Failed to unenroll from course', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/enrollments/status/:courseId', async (c) => {
    const parsedParams = EnrollmentStatusParamsSchema.safeParse({
      courseId: c.req.param('courseId'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_ENROLLMENT_STATUS_PARAMS',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(
          401,
          'UNAUTHORIZED',
          'You must be logged in to check enrollment status.',
        ),
      );
    }

    const result = await checkEnrollment(
      supabase,
      user.id,
      parsedParams.data.courseId,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<EnrollmentServiceError, unknown>;
      logger.error('Failed to check enrollment status', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });
};
