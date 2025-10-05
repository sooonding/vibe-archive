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
