import type { Hono } from 'hono';
import { z } from 'zod';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  getCourseAssignments,
  getAssignmentDetail,
  getAssignmentDetailForInstructor,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateAssignmentStatus,
  getAssignmentSubmissions,
} from './service';
import { assignmentErrorCodes, type AssignmentServiceError } from './error';
import {
  CreateAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
  UpdateAssignmentStatusRequestSchema,
} from './schema';
import { getSubmissionHistory } from '@/features/submission/backend/service';
import {
  submissionErrorCodes,
  type SubmissionServiceError,
} from '@/features/submission/backend/error';

const CourseIdParamsSchema = z.object({
  courseId: z.string().uuid(),
});

const AssignmentIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  app.get('/courses/:courseId/assignments', async (c) => {
    const parsedParams = CourseIdParamsSchema.safeParse({
      courseId: c.req.param('courseId'),
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in.'),
      );
    }

    const result = await getCourseAssignments(
      supabase,
      parsedParams.data.courseId,
      user.id,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.notEnrolled) {
        logger.warn(
          'User not enrolled in course',
          user.id,
          parsedParams.data.courseId,
        );
      } else if (errorResult.error.code === assignmentErrorCodes.fetchError) {
        logger.error('Failed to fetch course assignments', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/assignments/:id', async (c) => {
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

    // Check if user is instructor for this assignment
    const { data: assignment } = await supabase
      .from('assignments')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', parsedParams.data.id)
      .maybeSingle();

    const isInstructor = assignment &&
      (assignment.courses as any)?.instructor_id === user.id;

    // Use different service based on role
    const result = isInstructor
      ? await getAssignmentDetailForInstructor(
          supabase,
          parsedParams.data.id,
          user.id,
        )
      : await getAssignmentDetail(
          supabase,
          parsedParams.data.id,
          user.id,
        );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notPublished) {
        logger.warn('Assignment not published', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notEnrolled) {
        logger.warn('User not enrolled in assignment course', user.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not assignment owner', user.id, parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.fetchError) {
        logger.error('Failed to fetch assignment detail', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  app.get('/assignments/:id/submissions', async (c) => {
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

    const result = await getSubmissionHistory(
      supabase,
      parsedParams.data.id,
      user.id,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<
        SubmissionServiceError,
        unknown
      >;
      logger.error(
        'Failed to fetch submission history',
        errorResult.error.message,
      );
      return respond(c, result);
    }

    return respond(c, result);
  });

  // POST /courses/:courseId/assignments - Create assignment
  app.post('/courses/:courseId/assignments', async (c) => {
    const parsedParams = CourseIdParamsSchema.safeParse({
      courseId: c.req.param('courseId'),
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return respond(
        c,
        failure(401, 'UNAUTHORIZED', 'You must be logged in.'),
      );
    }

    const body = await c.req.json();
    const parsedBody = CreateAssignmentRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          assignmentErrorCodes.validationError,
          'Invalid request body.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await createAssignment(
      supabase,
      parsedParams.data.courseId,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.courseNotFound) {
        logger.warn('Course not found', parsedParams.data.courseId);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not course owner', user.id, parsedParams.data.courseId);
      } else if (errorResult.error.code === assignmentErrorCodes.createError) {
        logger.error('Failed to create assignment', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // PUT /assignments/:id - Update assignment
  app.put('/assignments/:id', async (c) => {
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

    const body = await c.req.json();
    const parsedBody = UpdateAssignmentRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          assignmentErrorCodes.validationError,
          'Invalid request body.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateAssignment(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not assignment owner', user.id, parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.updateError) {
        logger.error('Failed to update assignment', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // DELETE /assignments/:id - Delete assignment
  app.delete('/assignments/:id', async (c) => {
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

    const result = await deleteAssignment(
      supabase,
      parsedParams.data.id,
      user.id,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not assignment owner', user.id, parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.invalidStatus) {
        logger.warn('Cannot delete non-draft assignment', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.hasSubmissions) {
        logger.warn('Cannot delete assignment with submissions', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.deleteError) {
        logger.error('Failed to delete assignment', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // PATCH /assignments/:id/status - Update assignment status
  app.patch('/assignments/:id/status', async (c) => {
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

    const body = await c.req.json();
    const parsedBody = UpdateAssignmentStatusRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          assignmentErrorCodes.validationError,
          'Invalid request body.',
          parsedBody.error.format(),
        ),
      );
    }

    const result = await updateAssignmentStatus(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data.status,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not assignment owner', user.id, parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.invalidStatus) {
        logger.warn('Invalid status transition', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.updateError) {
        logger.error('Failed to update assignment status', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });

  // GET /assignments/:id/instructor/submissions - Get assignment submissions (instructor)
  app.get('/assignments/:id/instructor/submissions', async (c) => {
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

    const result = await getAssignmentSubmissions(
      supabase,
      parsedParams.data.id,
      user.id,
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<AssignmentServiceError, unknown>;

      if (errorResult.error.code === assignmentErrorCodes.assignmentNotFound) {
        logger.warn('Assignment not found', parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.notOwner) {
        logger.warn('User is not assignment owner', user.id, parsedParams.data.id);
      } else if (errorResult.error.code === assignmentErrorCodes.fetchError) {
        logger.error('Failed to fetch assignment submissions', errorResult.error.message);
      }

      return respond(c, result);
    }

    return respond(c, result);
  });
};
