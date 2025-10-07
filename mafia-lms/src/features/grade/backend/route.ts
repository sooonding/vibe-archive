import type { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '@/backend/hono/context';
import {
  getMyGrades,
  getSubmissionDetail,
  gradeSubmission,
  requestResubmission,
} from './service';
import { respond, failure } from '@/backend/http/response';
import {
  GradeSubmissionRequestSchema,
  RequestResubmissionRequestSchema,
} from './schema';

const SubmissionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const registerGradeRoutes = (app: Hono<AppEnv>) => {
  app.get('/grades/my', async (c) => {
    const supabase = c.get('supabase');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const result = await getMyGrades(supabase, user.id);
    return respond(c, result);
  });

  app.get('/submissions/:id/detail', async (c) => {
    const parsedParams = SubmissionIdParamSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SUBMISSION_ID',
          'The provided submission id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = c.get('supabase');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const result = await getSubmissionDetail(
      supabase,
      parsedParams.data.id,
      user.id,
    );
    return respond(c, result);
  });

  app.post('/submissions/:id/grade', async (c) => {
    const parsedParams = SubmissionIdParamSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SUBMISSION_ID',
          'The provided submission id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = c.get('supabase');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, 'INVALID_JSON', 'Invalid JSON body.'));
    }

    const parsedBody = GradeSubmissionRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'VALIDATION_ERROR',
          'Invalid grade data.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await gradeSubmission(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data,
    );
    return respond(c, result);
  });

  app.patch('/submissions/:id/resubmit', async (c) => {
    const parsedParams = SubmissionIdParamSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_SUBMISSION_ID',
          'The provided submission id is invalid.',
          parsedParams.error.format(),
        ),
      );
    }

    const supabase = c.get('supabase');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return respond(c, failure(400, 'INVALID_JSON', 'Invalid JSON body.'));
    }

    const parsedBody = RequestResubmissionRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'VALIDATION_ERROR',
          'Invalid resubmission request data.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await requestResubmission(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data.feedback,
    );
    return respond(c, result);
  });
};
