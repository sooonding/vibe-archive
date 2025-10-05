import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CourseTableRowSchema,
  PublicCourseSchema,
  type PublicCourse,
  type CourseRow,
} from './schema';
import { courseErrorCodes, type CourseServiceError } from './error';

export const getPublicCourses = async (
  client: SupabaseClient,
): Promise<HandlerResult<PublicCourse[], CourseServiceError, unknown>> => {
  const { data: courses, error } = await client
    .from('courses')
    .select('id, title, description, category, difficulty, instructor_id')
    .eq('status', 'published');

  if (error) {
    return failure(500, courseErrorCodes.fetchError, error.message);
  }

  if (!courses || courses.length === 0) {
    return success([]);
  }

  const instructorIds = courses.map((c) => c.instructor_id);
  const { data: profiles } = await client
    .from('profiles')
    .select('user_id, name')
    .in('user_id', instructorIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.user_id, p.name])
  );

  const mappedCourses: PublicCourse[] = [];

  for (const row of courses) {
    const instructorName = profileMap.get(row.instructor_id) ?? 'Unknown Instructor';

    const courseRow: CourseRow = {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      instructor_id: row.instructor_id,
      instructor_name: instructorName,
    };

    const rowParse = CourseTableRowSchema.safeParse(courseRow);

    if (!rowParse.success) {
      return failure(
        500,
        courseErrorCodes.validationError,
        'Course row 검증 실패',
        rowParse.error.format(),
      );
    }

    const mapped: PublicCourse = {
      id: rowParse.data.id,
      title: rowParse.data.title,
      description: rowParse.data.description,
      category: rowParse.data.category,
      difficulty: rowParse.data.difficulty,
      instructorName: rowParse.data.instructor_name,
    };

    const parsed = PublicCourseSchema.safeParse(mapped);

    if (!parsed.success) {
      return failure(
        500,
        courseErrorCodes.validationError,
        'Course 검증 실패',
        parsed.error.format(),
      );
    }

    mappedCourses.push(parsed.data);
  }

  return success(mappedCourses);
};
