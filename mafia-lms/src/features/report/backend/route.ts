import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  getReports,
  getReportDetail,
  updateReportStatus,
  executeAction,
} from './service';
import { reportErrorCodes, type ReportServiceError } from './error';
import {
  ReportQueryParamsSchema,
  ReportDetailParamsSchema,
  UpdateReportStatusSchema,
  ExecuteActionSchema,
} from './schema';
import { operatorGuard } from '@/backend/middleware/operator-guard';

export const registerReportRoutes = (app: Hono<AppEnv>) => {
  // GET /reports - Get all reports (Operator only)
  app.get('/reports', operatorGuard(), async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const queryParams = {
      status: c.req.query('status'),
      targetType: c.req.query('targetType'),
    };

    const parsedParams = ReportQueryParamsSchema.safeParse(queryParams);

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_QUERY_PARAMS',
          'The provided query parameters are invalid.',
          parsedParams.error.format()
        )
      );
    }

    const result = await getReports(supabase, parsedParams.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ReportServiceError, unknown>;
      logger.error('Failed to fetch reports', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // GET /reports/:id - Get report detail (Operator only)
  app.get('/reports/:id', operatorGuard(), async (c) => {
    const parsedParams = ReportDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REPORT_ID',
          'The provided report id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getReportDetail(supabase, parsedParams.data.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<ReportServiceError, unknown>;
      logger.error('Failed to fetch report detail', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PATCH /reports/:id/status - Update report status (Operator only)
  app.patch('/reports/:id/status', operatorGuard(), async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required')
      );
    }

    const parsedParams = ReportDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REPORT_ID',
          'The provided report id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateReportStatusSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UPDATE_STATUS_REQUEST',
          'The provided status is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await updateReportStatus(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<ReportServiceError, unknown>;
      logger.error('Failed to update report status', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // POST /reports/:id/action - Execute action (Operator only)
  app.post('/reports/:id/action', operatorGuard(), async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'Authentication required')
      );
    }

    const parsedParams = ReportDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_REPORT_ID',
          'The provided report id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const body = await c.req.json();
    const parsedBody = ExecuteActionSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_EXECUTE_ACTION_REQUEST',
          'The provided action data is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await executeAction(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<ReportServiceError, unknown>;
      logger.error('Failed to execute action', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });
};
