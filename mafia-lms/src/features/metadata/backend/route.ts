import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategory,
  getDifficulties,
  createDifficulty,
  updateDifficulty,
  toggleDifficulty,
} from './service';
import { metadataErrorCodes, type MetadataServiceError } from './error';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  CreateDifficultySchema,
  UpdateDifficultySchema,
  MetadataDetailParamsSchema,
  MetadataQueryParamsSchema,
} from './schema';
import { operatorGuard } from '@/backend/middleware/operator-guard';

export const registerMetadataRoutes = (app: Hono<AppEnv>) => {
  // Categories

  // GET /metadata/categories
  app.get('/metadata/categories', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const queryParams = {
      activeOnly: c.req.query('activeOnly'),
    };

    const parsedParams = MetadataQueryParamsSchema.safeParse(queryParams);

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

    const result = await getCategories(supabase, parsedParams.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to fetch categories', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // POST /metadata/categories
  app.post('/metadata/categories', operatorGuard(), async (c) => {
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

    const body = await c.req.json();
    const parsedBody = CreateCategorySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CREATE_CATEGORY_REQUEST',
          'The provided category data is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await createCategory(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to create category', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PUT /metadata/categories/:id
  app.put('/metadata/categories/:id', operatorGuard(), async (c) => {
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

    const parsedParams = MetadataDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CATEGORY_ID',
          'The provided category id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateCategorySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UPDATE_CATEGORY_REQUEST',
          'The provided category data is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await updateCategory(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to update category', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PATCH /metadata/categories/:id/toggle
  app.patch('/metadata/categories/:id/toggle', operatorGuard(), async (c) => {
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

    const parsedParams = MetadataDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CATEGORY_ID',
          'The provided category id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const result = await toggleCategory(supabase, parsedParams.data.id, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to toggle category', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // Difficulties

  // GET /metadata/difficulties
  app.get('/metadata/difficulties', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const queryParams = {
      activeOnly: c.req.query('activeOnly'),
    };

    const parsedParams = MetadataQueryParamsSchema.safeParse(queryParams);

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

    const result = await getDifficulties(supabase, parsedParams.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to fetch difficulties', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // POST /metadata/difficulties
  app.post('/metadata/difficulties', operatorGuard(), async (c) => {
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

    const body = await c.req.json();
    const parsedBody = CreateDifficultySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CREATE_DIFFICULTY_REQUEST',
          'The provided difficulty data is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await createDifficulty(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to create difficulty', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PUT /metadata/difficulties/:id
  app.put('/metadata/difficulties/:id', operatorGuard(), async (c) => {
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

    const parsedParams = MetadataDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_DIFFICULTY_ID',
          'The provided difficulty id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const body = await c.req.json();
    const parsedBody = UpdateDifficultySchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_UPDATE_DIFFICULTY_REQUEST',
          'The provided difficulty data is invalid.',
          parsedBody.error.format()
        )
      );
    }

    const result = await updateDifficulty(
      supabase,
      parsedParams.data.id,
      user.id,
      parsedBody.data
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to update difficulty', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });

  // PATCH /metadata/difficulties/:id/toggle
  app.patch('/metadata/difficulties/:id/toggle', operatorGuard(), async (c) => {
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

    const parsedParams = MetadataDetailParamsSchema.safeParse({
      id: c.req.param('id'),
    });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          'INVALID_DIFFICULTY_ID',
          'The provided difficulty id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const result = await toggleDifficulty(supabase, parsedParams.data.id, user.id);

    if (!result.ok) {
      const errorResult = result as ErrorResult<MetadataServiceError, unknown>;
      logger.error('Failed to toggle difficulty', errorResult.error.message);
      return respond(c, result);
    }

    return respond(c, result);
  });
};
