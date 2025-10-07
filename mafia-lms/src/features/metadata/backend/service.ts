import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CategorySchema,
  DifficultySchema,
  type Category,
  type Difficulty,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CreateDifficultyRequest,
  type UpdateDifficultyRequest,
  type MetadataQueryParams,
} from './schema';
import { metadataErrorCodes, type MetadataServiceError } from './error';
import { createAuditLog } from '@/backend/utils/audit-log';

// Categories
export const getCategories = async (
  client: SupabaseClient,
  queryParams?: MetadataQueryParams
): Promise<HandlerResult<Category[], MetadataServiceError, unknown>> => {
  let query = client.from('categories').select('*').order('name');

  if (queryParams?.activeOnly === 'true') {
    query = query.eq('active', true);
  }

  const { data: categories, error } = await query;

  if (error) {
    return failure(500, metadataErrorCodes.fetchError, error.message);
  }

  if (!categories || categories.length === 0) {
    return success([]);
  }

  const mapped: Category[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    active: c.active,
    createdAt: c.created_at,
  }));

  const validated: Category[] = [];

  for (const category of mapped) {
    const parsed = CategorySchema.safeParse(category);
    if (!parsed.success) {
      return failure(
        500,
        metadataErrorCodes.validationError,
        'Category validation failed',
        parsed.error.format()
      );
    }
    validated.push(parsed.data);
  }

  return success(validated);
};

export const createCategory = async (
  client: SupabaseClient,
  operatorId: string,
  data: CreateCategoryRequest
): Promise<HandlerResult<Category, MetadataServiceError, unknown>> => {
  const { data: existing } = await client
    .from('categories')
    .select('id')
    .eq('name', data.name)
    .single();

  if (existing) {
    return failure(
      400,
      metadataErrorCodes.duplicateName,
      '이미 존재하는 카테고리명입니다'
    );
  }

  const { data: category, error } = await client
    .from('categories')
    .insert({
      name: data.name,
      active: true,
    })
    .select()
    .single();

  if (error || !category) {
    return failure(500, metadataErrorCodes.createError, error?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    'create_category',
    'category',
    category.id
  );

  const mapped: Category = {
    id: category.id,
    name: category.name,
    active: category.active,
    createdAt: category.created_at,
  };

  const parsed = CategorySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Category validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

export const updateCategory = async (
  client: SupabaseClient,
  categoryId: string,
  operatorId: string,
  data: UpdateCategoryRequest
): Promise<HandlerResult<Category, MetadataServiceError, unknown>> => {
  const { data: category, error: fetchError } = await client
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .single();

  if (fetchError || !category) {
    return failure(
      404,
      metadataErrorCodes.metadataNotFound,
      'Category not found'
    );
  }

  if (data.name) {
    const { data: existing } = await client
      .from('categories')
      .select('id')
      .eq('name', data.name)
      .neq('id', categoryId)
      .single();

    if (existing) {
      return failure(
        400,
        metadataErrorCodes.duplicateName,
        '이미 존재하는 카테고리명입니다'
      );
    }
  }

  const { data: updated, error: updateError } = await client
    .from('categories')
    .update(data)
    .eq('id', categoryId)
    .select()
    .single();

  if (updateError || !updated) {
    return failure(500, metadataErrorCodes.updateError, updateError?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    'update_category',
    'category',
    categoryId
  );

  const mapped: Category = {
    id: updated.id,
    name: updated.name,
    active: updated.active,
    createdAt: updated.created_at,
  };

  const parsed = CategorySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Category validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

export const toggleCategory = async (
  client: SupabaseClient,
  categoryId: string,
  operatorId: string
): Promise<HandlerResult<Category, MetadataServiceError, unknown>> => {
  const { data: category, error: fetchError } = await client
    .from('categories')
    .select('active')
    .eq('id', categoryId)
    .single();

  if (fetchError || !category) {
    return failure(
      404,
      metadataErrorCodes.metadataNotFound,
      'Category not found'
    );
  }

  const newActive = !category.active;

  const { data: updated, error: updateError } = await client
    .from('categories')
    .update({ active: newActive })
    .eq('id', categoryId)
    .select()
    .single();

  if (updateError || !updated) {
    return failure(500, metadataErrorCodes.updateError, updateError?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    `toggle_category_${newActive ? 'active' : 'inactive'}`,
    'category',
    categoryId
  );

  const mapped: Category = {
    id: updated.id,
    name: updated.name,
    active: updated.active,
    createdAt: updated.created_at,
  };

  const parsed = CategorySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Category validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

// Difficulties
export const getDifficulties = async (
  client: SupabaseClient,
  queryParams?: MetadataQueryParams
): Promise<HandlerResult<Difficulty[], MetadataServiceError, unknown>> => {
  let query = client.from('difficulties').select('*').order('name');

  if (queryParams?.activeOnly === 'true') {
    query = query.eq('active', true);
  }

  const { data: difficulties, error } = await query;

  if (error) {
    return failure(500, metadataErrorCodes.fetchError, error.message);
  }

  if (!difficulties || difficulties.length === 0) {
    return success([]);
  }

  const mapped: Difficulty[] = difficulties.map((d) => ({
    id: d.id,
    name: d.name,
    active: d.active,
    createdAt: d.created_at,
  }));

  const validated: Difficulty[] = [];

  for (const difficulty of mapped) {
    const parsed = DifficultySchema.safeParse(difficulty);
    if (!parsed.success) {
      return failure(
        500,
        metadataErrorCodes.validationError,
        'Difficulty validation failed',
        parsed.error.format()
      );
    }
    validated.push(parsed.data);
  }

  return success(validated);
};

export const createDifficulty = async (
  client: SupabaseClient,
  operatorId: string,
  data: CreateDifficultyRequest
): Promise<HandlerResult<Difficulty, MetadataServiceError, unknown>> => {
  const { data: existing } = await client
    .from('difficulties')
    .select('id')
    .eq('name', data.name)
    .single();

  if (existing) {
    return failure(
      400,
      metadataErrorCodes.duplicateName,
      '이미 존재하는 난이도명입니다'
    );
  }

  const { data: difficulty, error } = await client
    .from('difficulties')
    .insert({
      name: data.name,
      active: true,
    })
    .select()
    .single();

  if (error || !difficulty) {
    return failure(500, metadataErrorCodes.createError, error?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    'create_difficulty',
    'difficulty',
    difficulty.id
  );

  const mapped: Difficulty = {
    id: difficulty.id,
    name: difficulty.name,
    active: difficulty.active,
    createdAt: difficulty.created_at,
  };

  const parsed = DifficultySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Difficulty validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

export const updateDifficulty = async (
  client: SupabaseClient,
  difficultyId: string,
  operatorId: string,
  data: UpdateDifficultyRequest
): Promise<HandlerResult<Difficulty, MetadataServiceError, unknown>> => {
  const { data: difficulty, error: fetchError } = await client
    .from('difficulties')
    .select('id')
    .eq('id', difficultyId)
    .single();

  if (fetchError || !difficulty) {
    return failure(
      404,
      metadataErrorCodes.metadataNotFound,
      'Difficulty not found'
    );
  }

  if (data.name) {
    const { data: existing } = await client
      .from('difficulties')
      .select('id')
      .eq('name', data.name)
      .neq('id', difficultyId)
      .single();

    if (existing) {
      return failure(
        400,
        metadataErrorCodes.duplicateName,
        '이미 존재하는 난이도명입니다'
      );
    }
  }

  const { data: updated, error: updateError } = await client
    .from('difficulties')
    .update(data)
    .eq('id', difficultyId)
    .select()
    .single();

  if (updateError || !updated) {
    return failure(500, metadataErrorCodes.updateError, updateError?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    'update_difficulty',
    'difficulty',
    difficultyId
  );

  const mapped: Difficulty = {
    id: updated.id,
    name: updated.name,
    active: updated.active,
    createdAt: updated.created_at,
  };

  const parsed = DifficultySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Difficulty validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};

export const toggleDifficulty = async (
  client: SupabaseClient,
  difficultyId: string,
  operatorId: string
): Promise<HandlerResult<Difficulty, MetadataServiceError, unknown>> => {
  const { data: difficulty, error: fetchError } = await client
    .from('difficulties')
    .select('active')
    .eq('id', difficultyId)
    .single();

  if (fetchError || !difficulty) {
    return failure(
      404,
      metadataErrorCodes.metadataNotFound,
      'Difficulty not found'
    );
  }

  const newActive = !difficulty.active;

  const { data: updated, error: updateError } = await client
    .from('difficulties')
    .update({ active: newActive })
    .eq('id', difficultyId)
    .select()
    .single();

  if (updateError || !updated) {
    return failure(500, metadataErrorCodes.updateError, updateError?.message);
  }

  await createAuditLog(
    client,
    operatorId,
    `toggle_difficulty_${newActive ? 'active' : 'inactive'}`,
    'difficulty',
    difficultyId
  );

  const mapped: Difficulty = {
    id: updated.id,
    name: updated.name,
    active: updated.active,
    createdAt: updated.created_at,
  };

  const parsed = DifficultySchema.safeParse(mapped);

  if (!parsed.success) {
    return failure(
      500,
      metadataErrorCodes.validationError,
      'Difficulty validation failed',
      parsed.error.format()
    );
  }

  return success(parsed.data);
};
