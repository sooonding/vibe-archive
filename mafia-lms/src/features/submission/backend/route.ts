import type { Hono } from 'hono';
import { z } from 'zod';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { createOrUpdateSubmission } from './service';
import { submissionErrorCodes, type SubmissionServiceError } from './error';
import { CreateSubmissionRequestSchema } from './schema';

const AssignmentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const registerSubmissionRoutes = (app: Hono<AppEnv>) => {
  app.post('/assignments/:id/submissions', async (c) => {
    const parsedParams = AssignmentIdParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_ASSIGNMENT_ID',
          'The provided assignment id is invalid.',
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
        failure(401, 'UNAUTHORIZED', 'You must be logged in.'),
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch {
      return respond(
        c,
        failure(400, 'INVALID_JSON', 'Invalid JSON body.'),
      );
    }

    const parsedBody = CreateSubmissionRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          submissionErrorCodes.validationError,
          'Invalid submission data.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await createOrUpdateSubmission(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<SubmissionServiceError, unknown>;

      if (errorResult.error.code === submissionErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === submissionErrorCodes.assignmentClosed) {
        logger.warn('Assignment is closed', parsedParams.data.id);
      } else if (errorResult.error.code === submissionErrorCodes.pastDueNotAllowed) {
        logger.warn('Submission past due not allowed', parsedParams.data.id);
      } else if (errorResult.error.code === submissionErrorCodes.resubmissionNotAllowed) {
        logger.warn('Resubmission not allowed', parsedParams.data.id);
      } else if (errorResult.error.code === submissionErrorCodes.notEnrolled) {
        logger.warn('User not enrolled in course', user.id);
      } else if (errorResult.error.code === submissionErrorCodes.createError) {
        logger.error('Failed to create submission', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
