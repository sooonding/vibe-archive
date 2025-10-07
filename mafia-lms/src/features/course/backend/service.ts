import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CourseTableRowSchema,
  PublicCourseSchema,
  CourseDetailSchema,
  type PublicCourse,
  type CourseRow,
  type CourseDetail,
  type CourseQueryParams,
  type CreateCourseRequest,
  type UpdateCourseRequest,
  type CourseDetailFull,
} from './schema';
import { courseErrorCodes, type CourseServiceError } from './error';
import type { InstructorCourse } from '@/features/dashboard/backend/schema';

export const getPublicCourses = async (
  client: SupabaseClient,
  queryParams?: CourseQueryParams,
): Promise<HandlerResult<PublicCourse[], CourseServiceError, unknown>> => {
  let query = client
    .from('courses')
    .select('id, title, description, category, difficulty, instructor_id')
    .eq('status', 'published');

  if (queryParams?.search) {
    query = query.or(
      `title.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`,
    );
  }

  if (queryParams?.category) {
    query = query.eq('category', queryParams.category);
  }

  if (queryParams?.difficulty) {
    query = query.eq('difficulty', queryParams.difficulty);
  }

  if (queryParams?.sortBy) {
    const ascending = queryParams.sortOrder === 'asc';
    query = query.order(queryParams.sortBy, { ascending });
  }

  const { data: courses, error } = await query;

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

export const getCourseDetail = async (
  client: SupabaseClient,
  courseId: string,
): Promise<HandlerResult<CourseDetail, CourseServiceError, unknown>> => {
  const { data: course, error } = await client
    .from('courses')
    .select('id, title, description, category, difficulty, curriculum, instructor_id, created_at')
    .eq('id', courseId)
    .single();

  if (error || !course) {
    return failure(404, courseErrorCodes.courseNotFound, 'Course not found');
  }

  const { data: profile } = await client
    .from('profiles')
    .select('name')
    .eq('user_id', course.instructor_id)
    .single();

  const instructorName = profile?.name ?? 'Unknown Instructor';

  const detail: CourseDetail = {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    difficulty: course.difficulty,
    curriculum: course.curriculum,
    instructorName,
    createdAt: course.created_at,
  };

  const parsed = CourseDetailSchema.safeParse(detail);

  if (!parsed.success) {
    return failure(
      500,
      courseErrorCodes.validationError,
      'Course detail 검증 실패',
      parsed.error.format(),
    );
  }

  return success(parsed.data);
};

export const getInstructorCourses = async (
  client: SupabaseClient,
  instructorId: string,
): Promise<HandlerResult<InstructorCourse[], CourseServiceError, unknown>> => {
  try {
    const { data: courses, error: coursesError } = await client
      .from('courses')
      .select('id, title, description, status')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      return failure(500, courseErrorCodes.fetchError, coursesError.message);
    }

    if (!courses || courses.length === 0) {
      return success([]);
    }

    const instructorCourses: InstructorCourse[] = [];

    for (const course of courses) {
      const { count: enrolledCount } = await client
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      const { count: assignmentCount } = await client
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);

      instructorCourses.push({
        courseId: course.id,
        title: course.title,
        description: course.description,
        status: course.status as 'draft' | 'published' | 'archived',
        enrolledCount: enrolledCount ?? 0,
        assignmentCount: assignmentCount ?? 0,
      });
    }

    return success(instructorCourses);
  } catch (error) {
    return failure(
      500,
      courseErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

// Helper function for status transition validation
const canTransitionStatus = (
  currentStatus: string,
  newStatus: string,
  enrolledCount: number,
): { allowed: boolean; reason?: string } => {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  // draft → archived 불가
  if (currentStatus === 'draft' && newStatus === 'archived') {
    return {
      allowed: false,
      reason: 'Draft 코스는 직접 Archived로 전환할 수 없습니다',
    };
  }

  // published → draft (수강생 있음) 불가
  if (
    currentStatus === 'published' &&
    newStatus === 'draft' &&
    enrolledCount > 0
  ) {
    return {
      allowed: false,
      reason: '수강생이 있는 코스는 Draft로 전환할 수 없습니다',
    };
  }

  // archived → draft 불가
  if (currentStatus === 'archived' && newStatus === 'draft') {
    return {
      allowed: false,
      reason: 'Archived 코스는 Draft로 전환할 수 없습니다',
    };
  }

  return { allowed: true };
};

export const createCourse = async (
  client: SupabaseClient,
  instructorId: string,
  data: CreateCourseRequest,
): Promise<HandlerResult<CourseDetailFull, CourseServiceError, unknown>> => {
  try {
    // 1. Check user role
    const { data: user, error: userError } = await client
      .from('users')
      .select('role')
      .eq('id', instructorId)
      .single();

    if (userError || !user) {
      return failure(500, courseErrorCodes.fetchError, 'User not found');
    }

    if (user.role !== 'instructor') {
      return failure(
        403,
        courseErrorCodes.invalidRole,
        'Only instructors can create courses',
      );
    }

    // 2. Create course
    const { data: course, error: courseError } = await client
      .from('courses')
      .insert({
        instructor_id: instructorId,
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        curriculum: data.curriculum || null,
        status: 'draft',
      })
      .select()
      .single();

    if (courseError || !course) {
      return failure(500, courseErrorCodes.createError, courseError?.message);
    }

    // 3. Get instructor profile
    const { data: profile } = await client
      .from('profiles')
      .select('name')
      .eq('user_id', instructorId)
      .single();

    return success({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      curriculum: course.curriculum,
      status: course.status as 'draft' | 'published' | 'archived',
      instructorId: course.instructor_id,
      instructorName: profile?.name || 'Unknown',
      enrolledCount: 0,
      assignmentCount: 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    });
  } catch (error) {
    return failure(
      500,
      courseErrorCodes.createError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getCourseDetailFull = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string,
): Promise<HandlerResult<CourseDetailFull, CourseServiceError, unknown>> => {
  try {
    // 1. Get course
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return failure(404, courseErrorCodes.courseNotFound, 'Course not found');
    }

    // 2. Check ownership
    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        courseErrorCodes.unauthorizedAccess,
        'You do not have permission to access this course',
      );
    }

    // 3. Get instructor profile
    const { data: profile } = await client
      .from('profiles')
      .select('name')
      .eq('user_id', course.instructor_id)
      .single();

    // 4. Get enrolled count
    const { count: enrolledCount } = await client
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // 5. Get assignment count
    const { count: assignmentCount } = await client
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    return success({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      curriculum: course.curriculum,
      status: course.status as 'draft' | 'published' | 'archived',
      instructorId: course.instructor_id,
      instructorName: profile?.name || 'Unknown',
      enrolledCount: enrolledCount ?? 0,
      assignmentCount: assignmentCount ?? 0,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    });
  } catch (error) {
    return failure(
      500,
      courseErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const updateCourse = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string,
  data: UpdateCourseRequest,
): Promise<HandlerResult<CourseDetailFull, CourseServiceError, unknown>> => {
  try {
    // 1. Get course and check ownership
    const { data: existingCourse, error: fetchError } = await client
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (fetchError || !existingCourse) {
      return failure(404, courseErrorCodes.courseNotFound, 'Course not found');
    }

    if (existingCourse.instructor_id !== instructorId) {
      return failure(
        403,
        courseErrorCodes.unauthorizedAccess,
        'You do not have permission to update this course',
      );
    }

    // 2. Update course
    const { data: course, error: updateError } = await client
      .from('courses')
      .update(data)
      .eq('id', courseId)
      .select()
      .single();

    if (updateError || !course) {
      return failure(500, courseErrorCodes.updateError, updateError?.message);
    }

    // 3. Get full course details
    return getCourseDetailFull(client, courseId, instructorId);
  } catch (error) {
    return failure(
      500,
      courseErrorCodes.updateError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const updateCourseStatus = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string,
  newStatus: 'draft' | 'published' | 'archived',
): Promise<HandlerResult<CourseDetailFull, CourseServiceError, unknown>> => {
  try {
    // 1. Get course and check ownership
    const { data: course, error: fetchError } = await client
      .from('courses')
      .select('instructor_id, status')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      return failure(404, courseErrorCodes.courseNotFound, 'Course not found');
    }

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        courseErrorCodes.unauthorizedAccess,
        'You do not have permission to update this course',
      );
    }

    // 2. Get enrolled count
    const { count: enrolledCount } = await client
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // 3. Check if transition is allowed
    const transitionCheck = canTransitionStatus(
      course.status,
      newStatus,
      enrolledCount ?? 0,
    );

    if (!transitionCheck.allowed) {
      return failure(
        400,
        courseErrorCodes.invalidStatusTransition,
        transitionCheck.reason || 'Invalid status transition',
      );
    }

    // 4. Update status
    const { error: updateError } = await client
      .from('courses')
      .update({ status: newStatus })
      .eq('id', courseId);

    if (updateError) {
      return failure(500, courseErrorCodes.updateError, updateError.message);
    }

    // 5. Get full course details
    return getCourseDetailFull(client, courseId, instructorId);
  } catch (error) {
    return failure(
      500,
      courseErrorCodes.updateError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};
