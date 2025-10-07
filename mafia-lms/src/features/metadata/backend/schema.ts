import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export const DifficultySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
});

export type Difficulty = z.infer<typeof DifficultySchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  active: z.boolean().optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>;

export const CreateDifficultySchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
});

export type CreateDifficultyRequest = z.infer<typeof CreateDifficultySchema>;

export const UpdateDifficultySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  active: z.boolean().optional(),
});

export type UpdateDifficultyRequest = z.infer<typeof UpdateDifficultySchema>;

export const MetadataDetailParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID must be a valid UUID.' }),
});

export type MetadataDetailParams = z.infer<typeof MetadataDetailParamsSchema>;

export const MetadataQueryParamsSchema = z.object({
  activeOnly: z.enum(['true', 'false']).optional(),
});

export type MetadataQueryParams = z.infer<typeof MetadataQueryParamsSchema>;
