import type { Hono } from 'hono';
import { respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { getPublicCourses } from './service';
import { courseErrorCodes, type CourseServiceError } from './error';

export const registerCourseRoutes = (app: Hono<AppEnv>) => {
  app.get('/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getPublicCourses(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CourseServiceError, unknown>;

      if (errorResult.error.code === courseErrorCodes.fetchError) {
        logger.error('Failed to fetch courses', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
