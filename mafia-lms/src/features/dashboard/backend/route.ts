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
import { getLearnerDashboard, getInstructorDashboard } from './service';
import { dashboardErrorCodes, type DashboardServiceError } from './error';

export const registerDashboardRoutes = (app: Hono<AppEnv>) => {
  app.get('/dashboard/learner', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in.'),
      );
    }

    const result = await getLearnerDashboard(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<DashboardServiceError, unknown>;

      if (errorResult.error.code === dashboardErrorCodes.invalidRole) {
        logger.warn('Invalid role attempting to access learner dashboard', user.id);
      } else {
        logger.error('Failed to fetch dashboard', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/dashboard/instructor', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in.'),
      );
    }

    const result = await getInstructorDashboard(supabase, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<DashboardServiceError, unknown>;

      if (errorResult.error.code === dashboardErrorCodes.invalidRole) {
        logger.warn(
          'Invalid role attempting to access instructor dashboard',
          user.id,
        );
      } else {
        logger.error(
          'Failed to fetch instructor dashboard',
          errorResult.error.message,
        );
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
