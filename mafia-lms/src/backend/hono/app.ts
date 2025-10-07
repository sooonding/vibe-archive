import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerAuthRoutes } from '@/features/auth/backend/route';
import { registerCourseRoutes } from '@/features/course/backend/route';
import { registerEnrollmentRoutes } from '@/features/enrollment/backend/route';
import { registerDashboardRoutes } from '@/features/dashboard/backend/route';
import { registerAssignmentRoutes } from '@/features/assignment/backend/route';
import { registerSubmissionRoutes } from '@/features/submission/backend/route';
import { registerGradeRoutes } from '@/features/grade/backend/route';
import { registerReportRoutes } from '@/features/report/backend/route';
import { registerMetadataRoutes } from '@/features/metadata/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp && process.env.NODE_ENV === 'production') {
    return singletonApp;
  }

  const app = new Hono<AppEnv>().basePath('/api');

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  app.get('/health', (c) => c.json({ status: 'ok' }));

  registerExampleRoutes(app);
  registerAuthRoutes(app);
  registerCourseRoutes(app);
  registerEnrollmentRoutes(app);
  registerDashboardRoutes(app);
  registerAssignmentRoutes(app);
  registerSubmissionRoutes(app);
  registerGradeRoutes(app);
  registerReportRoutes(app);
  registerMetadataRoutes(app);

  if (process.env.NODE_ENV === 'production') {
    singletonApp = app;
  }

  return app;
};
