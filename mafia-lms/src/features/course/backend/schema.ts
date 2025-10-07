import { z } from 'zod';

export const PublicCourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  difficulty: z.string(),
  instructorName: z.string(),
});

export type PublicCourse = z.infer<typeof PublicCourseSchema>;

export const PublicCoursesResponseSchema = z.array(PublicCourseSchema);

export const CourseTableRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  difficulty: z.string(),
  instructor_id: z.string().uuid(),
  instructor_name: z.string().nullable(),
});

export type CourseRow = z.infer<typeof CourseTableRowSchema>;

export const CourseDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  difficulty: z.string(),
  curriculum: z.string().nullable(),
  instructorName: z.string(),
  createdAt: z.string(),
});

export type CourseDetail = z.infer<typeof CourseDetailSchema>;

export const CourseQueryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  sortBy: z.enum(['title', 'category', 'difficulty', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CourseQueryParams = z.infer<typeof CourseQueryParamsSchema>;

export const CourseDetailParamsSchema = z.object({
  id: z.string().uuid({ message: 'Course ID must be a valid UUID.' }),
});

export type CourseDetailParams = z.infer<typeof CourseDetailParamsSchema>;

// 코스 생성 요청
export const CreateCourseRequestSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(200, '제목은 200자 이내로 입력해주세요'),
  description: z
    .string()
    .min(10, '설명은 최소 10자 이상 입력해주세요')
    .max(5000, '설명은 5000자 이내로 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: '난이도를 선택해주세요' }),
  }),
  curriculum: z.string().optional(),
});

// 코스 수정 요청
export const UpdateCourseRequestSchema = CreateCourseRequestSchema.partial();

// 상태 전환 요청
export const UpdateCourseStatusRequestSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

// 전체 코스 상세 (Instructor용)
export const CourseDetailFullSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  difficulty: z.string(),
  curriculum: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  instructorId: z.string().uuid(),
  instructorName: z.string(),
  enrolledCount: z.number(),
  assignmentCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateCourseRequest = z.infer<typeof CreateCourseRequestSchema>;
export type UpdateCourseRequest = z.infer<typeof UpdateCourseRequestSchema>;
export type UpdateCourseStatusRequest = z.infer<
  typeof UpdateCourseStatusRequestSchema
>;
export type CourseDetailFull = z.infer<typeof CourseDetailFullSchema>;
