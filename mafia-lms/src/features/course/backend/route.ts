import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  getPublicCourses,
  getCourseDetail,
  createCourse,
  getCourseDetailFull,
  updateCourse,
  updateCourseStatus,
} from './service';
import { courseErrorCodes, type CourseServiceError } from './error';
import {
  CourseQueryParamsSchema,
  CourseDetailParamsSchema,
  CreateCourseRequestSchema,
  UpdateCourseRequestSchema,
  UpdateCourseStatusRequestSchema,
} from './schema';

export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  app.get('/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const queryParams = {
      search: c.req.query('search'),
      category: c.req.query('category'),
      difficulty: c.req.query('difficulty'),
      sortBy: c.req.query('sortBy'),
      sortOrder: c.req.query('sortOrder'),
    };

    const parsedParams = CourseQueryParamsSchema.safeParse(queryParams);

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_COURSE_QUERY_PARAMS',
          'The provided query parameters are invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const result = await getPublicCourses(supabase, parsedParams.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;

      if (errorResult.error.code === courseErrorCodes.fetchError) {
        logger.error('Failed to fetch courses', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/courses/:id', async (c) => {
    const parsedParams = CourseDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_COURSE_ID',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCourseDetail(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;

      if (errorResult.error.code === courseErrorCodes.courseNotFound) {
        logger.warn('Course not found', parsedParams.data.id);
      } else {
        logger.error('Failed to fetch course detail', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // POST /courses - Create new course (Instructor only)
  app.post('/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required'),
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateCourseRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CREATE_COURSE_REQUEST',
          'The provided course data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await createCourse(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;
      logger.error('Failed to create course', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // GET /courses/:id/full - Get full course details (Instructor only, with ownership check)
  app.get('/courses/:id/full', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required'),
      );
    }

    const parsedParams = CourseDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_COURSE_ID',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const result = await getCourseDetailFull(
      supabase,
      parsedParams.data.id,
      user.id,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;
      logger.error('Failed to fetch full course detail', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PUT /courses/:id - Update course (Instructor only, with ownership check)
  app.put('/courses/:id', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required'),
      );
    }

    const parsedParams = CourseDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_COURSE_ID',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateCourseRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UPDATE_COURSE_REQUEST',
          'The provided course data is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateCourse(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;
      logger.error('Failed to update course', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PATCH /courses/:id/status - Update course status (Instructor only, with ownership check)
  app.patch('/courses/:id/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required'),
      );
    }

    const parsedParams = CourseDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_COURSE_ID',
          'The provided course id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateCourseStatusRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UPDATE_STATUS_REQUEST',
          'The provided status is invalid.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateCourseStatus(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data.status,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;
      logger.error('Failed to update course status', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });
};
