import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { assignmentErrorCodes, type AssignmentServiceError } from './error';
import type {
  UpcomingAssignment,
  CourseAssignment,
  AssignmentDetail,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmissionListItem,
} from './schema';

export const getUpcomingAssignments = async (
  client: SupabaseClient,
  learnerId: string,
): Promise<
  HandlerResult<UpcomingAssignment[], AssignmentServiceError, unknown>
> => {
  try {
    // 1. Get enrolled course IDs
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select('course_id')
      .eq('learner_id', learnerId);

    if (enrollmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        enrollmentError.message,
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return success([]);
    }

    const courseIds = enrollments.map((e) => e.course_id);

    // 2. Get upcoming assignments (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: assignments, error: assignmentError } = await client
      .from('assignments')
      .select('id, course_id, title, due_date, status')
      .in('course_id', courseIds)
      .eq('status', 'published')
      .gte('due_date', new Date().toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true });

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignments || assignments.length === 0) {
      return success([]);
    }

    // 3. Get submissions for these assignments
    const assignmentIds = assignments.map((a) => a.id);
    const { data: submissions } = await client
      .from('submissions')
      .select('assignment_id, status')
      .eq('learner_id', learnerId)
      .in('assignment_id', assignmentIds);

    const submissionMap = new Map(
      (submissions || []).map((s) => [s.assignment_id, s.status]),
    );

    // 4. Get course names
    const { data: courses } = await client
      .from('courses')
      .select('id, title')
      .in('id', courseIds);

    const courseMap = new Map((courses || []).map((c) => [c.id, c.title]));

    // 5. Build upcoming assignment list
    const upcomingAssignments: UpcomingAssignment[] = [];

    for (const assignment of assignments) {
      const submissionStatus = submissionMap.get(assignment.id);

      // Skip if already submitted (unless resubmission required)
      if (
        submissionStatus &&
        submissionStatus !== 'resubmission_required'
      ) {
        continue;
      }

      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      const dueInHours = Math.max(
        0,
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60),
      );

      upcomingAssignments.push({
        id: assignment.id,
        courseId: assignment.course_id,
        title: assignment.title,
        dueDate: assignment.due_date,
        status: assignment.status as 'draft' | 'published' | 'closed',
        courseName: courseMap.get(assignment.course_id) || 'Unknown Course',
        dueInHours: Math.round(dueInHours * 10) / 10,
        submissionStatus: submissionStatus === 'resubmission_required'
          ? 'resubmission_required'
          : 'not_submitted',
      });
    }

    return success(upcomingAssignments);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getCourseAssignments = async (
  client: SupabaseClient,
  courseId: string,
  userId: string,
): Promise<
  HandlerResult<CourseAssignment[], AssignmentServiceError, unknown>
> => {
  try {
    // 1. Check if user is instructor (course owner)
    const { data: course } = await client
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .maybeSingle();

    const isInstructor = course && course.instructor_id === userId;

    // 2. If not instructor, check enrollment
    if (!isInstructor) {
      const { data: enrollments, error: enrollmentError } = await client
        .from('enrollments')
        .select('course_id')
        .eq('learner_id', userId)
        .eq('course_id', courseId);

      if (enrollmentError) {
        return failure(
          500,
          assignmentErrorCodes.fetchError,
          enrollmentError.message,
        );
      }

      if (!enrollments || enrollments.length === 0) {
        return failure(
          403,
          assignmentErrorCodes.notEnrolled,
          'You are not enrolled in this course',
        );
      }
    }

    // 3. Get assignments (all if instructor, published only if learner)
    const query = client
      .from('assignments')
      .select('id, course_id, title, due_date, status')
      .eq('course_id', courseId);

    if (!isInstructor) {
      query.eq('status', 'published');
    }

    const { data: assignments, error: assignmentError } = await query.order('due_date', { ascending: true });

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignments || assignments.length === 0) {
      return success([]);
    }

    // 4. Get submissions (only for learners, not instructors)
    const submissionMap = new Map();
    if (!isInstructor) {
      const assignmentIds = assignments.map((a) => a.id);
      const { data: submissions } = await client
        .from('submissions')
        .select('assignment_id, status')
        .eq('learner_id', userId)
        .in('assignment_id', assignmentIds)
        .order('submitted_at', { ascending: false });

      // Create map of latest submission per assignment
      for (const submission of submissions || []) {
        if (!submissionMap.has(submission.assignment_id)) {
          submissionMap.set(submission.assignment_id, submission.status);
        }
      }
    }

    // 5. Build response
    const courseAssignments: CourseAssignment[] = assignments.map(
      (assignment) => {
        const submissionStatus = submissionMap.get(assignment.id);
        let status:
          | 'not_submitted'
          | 'submitted'
          | 'graded'
          | 'resubmission_required' = 'not_submitted';

        if (submissionStatus === 'graded') {
          status = 'graded';
        } else if (submissionStatus === 'resubmission_required') {
          status = 'resubmission_required';
        } else if (submissionStatus === 'submitted') {
          status = 'submitted';
        }

        return {
          id: assignment.id,
          courseId: assignment.course_id,
          title: assignment.title,
          dueDate: assignment.due_date,
          status: assignment.status as 'draft' | 'published' | 'closed',
          submissionStatus: status,
        };
      },
    );

    return success(courseAssignments);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getAssignmentDetail = async (
  client: SupabaseClient,
  assignmentId: string,
  learnerId: string,
): Promise<HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>> => {
  try {
    // 1. Get assignment
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select(
        'id, course_id, title, description, due_date, weight, allow_late, allow_resubmission, status',
      )
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    // 2. Check if published
    if (assignment.status !== 'published') {
      return failure(
        403,
        assignmentErrorCodes.notPublished,
        'This assignment is not yet published',
      );
    }

    // 3. Check enrollment
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select('course_id')
      .eq('learner_id', learnerId)
      .eq('course_id', assignment.course_id);

    if (enrollmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        enrollmentError.message,
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return failure(
        403,
        assignmentErrorCodes.notEnrolled,
        'You are not enrolled in this course',
      );
    }

    // 4. Get course name
    const { data: course } = await client
      .from('courses')
      .select('title')
      .eq('id', assignment.course_id)
      .maybeSingle();

    return success({
      id: assignment.id,
      courseId: assignment.course_id,
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.due_date,
      weight: assignment.weight,
      allowLate: assignment.allow_late,
      allowResubmission: assignment.allow_resubmission,
      status: assignment.status as 'draft' | 'published' | 'closed',
      courseName: course?.title || 'Unknown Course',
    });
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getAssignmentDetailForInstructor = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string,
): Promise<HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>> => {
  try {
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select(
        `
        id,
        course_id,
        title,
        description,
        due_date,
        weight,
        allow_late,
        allow_resubmission,
        status,
        courses!inner (
          instructor_id,
          title
        )
      `,
      )
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    const course = assignment.courses as any;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this course',
      );
    }

    return success({
      id: assignment.id,
      courseId: assignment.course_id,
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.due_date,
      weight: assignment.weight,
      allowLate: assignment.allow_late,
      allowResubmission: assignment.allow_resubmission,
      status: assignment.status as 'draft' | 'published' | 'closed',
      courseName: course.title,
    });
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const createAssignment = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string,
  data: CreateAssignmentRequest,
): Promise<
  HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>
> => {
  try {
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('id, instructor_id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        courseError.message,
      );
    }

    if (!course) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Course not found',
      );
    }

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this course',
      );
    }

    const { data: newAssignment, error: createError } = await client
      .from('assignments')
      .insert({
        course_id: courseId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        weight: data.weight,
        allow_late: data.allowLate ?? false,
        allow_resubmission: data.allowResubmission ?? false,
        status: 'draft',
      })
      .select('*')
      .single();

    if (createError || !newAssignment) {
      return failure(
        500,
        assignmentErrorCodes.createError,
        'Failed to create assignment',
      );
    }

    return getAssignmentDetailForInstructor(
      client,
      newAssignment.id,
      instructorId,
    );
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.createError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const updateAssignment = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string,
  data: UpdateAssignmentRequest,
): Promise<
  HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>
> => {
  try {
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select('id, course_id, courses!inner(instructor_id)')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    const course = Array.isArray(assignment.courses)
      ? assignment.courses[0]
      : assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this assignment',
      );
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.allowLate !== undefined) updateData.allow_late = data.allowLate;
    if (data.allowResubmission !== undefined)
      updateData.allow_resubmission = data.allowResubmission;

    const { error: updateError } = await client
      .from('assignments')
      .update(updateData)
      .eq('id', assignmentId);

    if (updateError) {
      return failure(
        500,
        assignmentErrorCodes.updateError,
        'Failed to update assignment',
      );
    }

    return getAssignmentDetailForInstructor(client, assignmentId, instructorId);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.updateError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const deleteAssignment = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string,
): Promise<HandlerResult<void, AssignmentServiceError, unknown>> => {
  try {
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select('id, status, course_id, courses!inner(instructor_id)')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    const course = Array.isArray(assignment.courses)
      ? assignment.courses[0]
      : assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this assignment',
      );
    }

    if (assignment.status !== 'draft') {
      return failure(
        400,
        assignmentErrorCodes.invalidStatus,
        'Only draft assignments can be deleted',
      );
    }

    const { data: submissions } = await client
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .limit(1);

    if (submissions && submissions.length > 0) {
      return failure(
        400,
        assignmentErrorCodes.hasSubmissions,
        'Cannot delete assignment with submissions',
      );
    }

    const { error: deleteError } = await client
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      return failure(
        500,
        assignmentErrorCodes.deleteError,
        'Failed to delete assignment',
      );
    }

    return success(undefined);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.deleteError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const updateAssignmentStatus = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string,
  status: 'draft' | 'published' | 'closed',
): Promise<
  HandlerResult<AssignmentDetail, AssignmentServiceError, unknown>
> => {
  try {
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select('id, status, course_id, courses!inner(instructor_id)')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    const course = Array.isArray(assignment.courses)
      ? assignment.courses[0]
      : assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this assignment',
      );
    }

    const currentStatus = assignment.status;
    const validTransitions: Record<string, string[]> = {
      draft: ['published'],
      published: ['closed'],
      closed: [],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return failure(
        400,
        assignmentErrorCodes.invalidStatus,
        `Cannot transition from ${currentStatus} to ${status}`,
      );
    }

    if (status === 'published' && currentStatus === 'draft') {
      const { data: fullAssignment } = await client
        .from('assignments')
        .select('title, description, due_date, weight')
        .eq('id', assignmentId)
        .maybeSingle();

      if (
        !fullAssignment?.title ||
        !fullAssignment?.description ||
        !fullAssignment?.due_date ||
        fullAssignment?.weight === undefined
      ) {
        return failure(
          400,
          assignmentErrorCodes.validationError,
          'Cannot publish assignment with incomplete information',
        );
      }
    }

    const { error: updateError } = await client
      .from('assignments')
      .update({ status })
      .eq('id', assignmentId);

    if (updateError) {
      return failure(
        500,
        assignmentErrorCodes.updateError,
        'Failed to update assignment status',
      );
    }

    return getAssignmentDetailForInstructor(client, assignmentId, instructorId);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.updateError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getAssignmentSubmissions = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string,
): Promise<
  HandlerResult<SubmissionListItem[], AssignmentServiceError, unknown>
> => {
  try {
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select('id, course_id, courses!inner(instructor_id)')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    if (!assignment) {
      return failure(
        404,
        assignmentErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    const course = Array.isArray(assignment.courses)
      ? assignment.courses[0]
      : assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        assignmentErrorCodes.notOwner,
        'You are not the owner of this assignment',
      );
    }

    // Get enrollments
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select('learner_id')
      .eq('course_id', assignment.course_id);

    if (enrollmentError) {
      return failure(
        500,
        assignmentErrorCodes.fetchError,
        enrollmentError.message,
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return success([]);
    }

    const learnerIds = enrollments.map((e) => e.learner_id);

    // Get learner profiles
    const { data: profiles } = await client
      .from('profiles')
      .select('user_id, name')
      .in('user_id', learnerIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p.name])
    );

    // Get submissions
    const { data: submissions } = await client
      .from('submissions')
      .select('id, learner_id, status, submitted_at, late, grades(score)')
      .eq('assignment_id', assignmentId)
      .in('learner_id', learnerIds)
      .order('submitted_at', { ascending: false });

    const submissionMap = new Map();
    for (const submission of submissions || []) {
      if (!submissionMap.has(submission.learner_id)) {
        submissionMap.set(submission.learner_id, submission);
      }
    }

    const submissionList: SubmissionListItem[] = enrollments.map((enrollment) => {
      const learnerName = profileMap.get(enrollment.learner_id) || 'Unknown';
      const submission = submissionMap.get(enrollment.learner_id);

      if (!submission) {
        return {
          submissionId: null,
          learnerId: enrollment.learner_id,
          learnerName,
          submissionStatus: 'not_submitted' as const,
          submittedAt: null,
          late: null,
          score: null,
        };
      }

      const grade = Array.isArray(submission.grades)
        ? submission.grades[0]
        : submission.grades;

      return {
        submissionId: submission.id,
        learnerId: submission.learner_id,
        learnerName,
        submissionStatus: submission.status,
        submittedAt: submission.submitted_at,
        late: submission.late,
        score: grade?.score ?? null,
      };
    });

    return success(submissionList);
  } catch (error) {
    return failure(
      500,
      assignmentErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};
