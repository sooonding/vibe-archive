import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { submissionErrorCodes, type SubmissionServiceError } from './error';
import type {
  FeedbackItem,
  SubmissionHistoryItem,
  CreateSubmissionRequest,
} from './schema';
import type { RecentSubmission } from '@/features/dashboard/backend/schema';

export const getRecentFeedback = async (
  client: SupabaseClient,
  learnerId: string,
): Promise<HandlerResult<FeedbackItem[], SubmissionServiceError, unknown>> => {
  try {
    // Get submissions with grades
    const { data: submissions, error: submissionError } = await client
      .from('submissions')
      .select(
        `
        id,
        assignment_id,
        status,
        assignments!inner (
          id,
          title,
          course_id,
          courses!inner (
            id,
            title
          )
        ),
        grades!inner (
          score,
          feedback,
          graded_at
        )
      `,
      )
      .eq('learner_id', learnerId)
      .in('status', ['graded', 'resubmission_required'])
      .not('grades.feedback', 'is', null)
      .order('grades(graded_at)', { ascending: false })
      .limit(5);

    if (submissionError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        submissionError.message,
      );
    }

    if (!submissions || submissions.length === 0) {
      return success([]);
    }

    const feedbackItems: FeedbackItem[] = submissions.map((submission: any) => {
      const assignment = submission.assignments;
      const course = assignment.courses;
      const grade = Array.isArray(submission.grades)
        ? submission.grades[0]
        : submission.grades;

      return {
        assignmentTitle: assignment.title,
        courseName: course.title,
        score: grade.score,
        feedback: grade.feedback,
        gradedAt: grade.graded_at,
        isResubmissionRequired: submission.status === 'resubmission_required',
      };
    });

    return success(feedbackItems);
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getCourseProgress = async (
  client: SupabaseClient,
  learnerId: string,
  courseId: string,
): Promise<
  HandlerResult<
    { total: number; completed: number },
    SubmissionServiceError,
    unknown
  >
> => {
  try {
    // Get total published assignments
    const { data: assignments, error: assignmentError } = await client
      .from('assignments')
      .select('id')
      .eq('course_id', courseId)
      .eq('status', 'published');

    if (assignmentError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        assignmentError.message,
      );
    }

    const total = assignments?.length || 0;

    if (total === 0) {
      return success({ total: 0, completed: 0 });
    }

    // Get completed submissions (submitted or graded, not resubmission_required)
    const assignmentIds = assignments.map((a) => a.id);
    const { data: submissions, error: submissionError } = await client
      .from('submissions')
      .select('assignment_id, status')
      .eq('learner_id', learnerId)
      .in('assignment_id', assignmentIds)
      .in('status', ['submitted', 'graded']);

    if (submissionError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        submissionError.message,
      );
    }

    // Count unique completed assignments
    const completedAssignmentIds = new Set(
      (submissions || []).map((s) => s.assignment_id),
    );
    const completed = completedAssignmentIds.size;

    return success({ total, completed });
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getSubmissionHistory = async (
  client: SupabaseClient,
  assignmentId: string,
  learnerId: string,
): Promise<
  HandlerResult<SubmissionHistoryItem[], SubmissionServiceError, unknown>
> => {
  try {
    const { data: submissions, error: submissionError } = await client
      .from('submissions')
      .select(
        `
        id,
        text,
        link,
        status,
        late,
        submitted_at,
        grades (
          score,
          feedback,
          graded_at
        )
      `,
      )
      .eq('assignment_id', assignmentId)
      .eq('learner_id', learnerId)
      .order('submitted_at', { ascending: false });

    if (submissionError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        submissionError.message,
      );
    }

    if (!submissions || submissions.length === 0) {
      return success([]);
    }

    const historyItems: SubmissionHistoryItem[] = submissions.map(
      (submission: any) => {
        const grade = Array.isArray(submission.grades)
          ? submission.grades[0]
          : submission.grades;

        return {
          id: submission.id,
          text: submission.text,
          link: submission.link,
          status: submission.status,
          late: submission.late,
          submittedAt: submission.submitted_at,
          grade: grade
            ? {
                score: grade.score,
                feedback: grade.feedback,
                gradedAt: grade.graded_at,
              }
            : null,
        };
      },
    );

    return success(historyItems);
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const createOrUpdateSubmission = async (
  client: SupabaseClient,
  assignmentId: string,
  learnerId: string,
  data: CreateSubmissionRequest,
): Promise<
  HandlerResult<SubmissionHistoryItem, SubmissionServiceError, unknown>
> => {
  try {
    // 1. 과제 정보 조회
    const { data: assignment, error: assignmentError } = await client
      .from('assignments')
      .select('id, course_id, status, due_date, allow_late, allow_resubmission')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignment) {
      return failure(
        404,
        submissionErrorCodes.assignmentNotFound,
        'Assignment not found',
      );
    }

    // 2. 과제 상태 검증
    if (assignment.status !== 'published') {
      return failure(
        403,
        submissionErrorCodes.assignmentClosed,
        'This assignment is not published or has been closed',
      );
    }

    // 3. 수강신청 여부 검증
    const { data: enrollment, error: enrollmentError } = await client
      .from('enrollments')
      .select('course_id')
      .eq('learner_id', learnerId)
      .eq('course_id', assignment.course_id)
      .single();

    if (enrollmentError || !enrollment) {
      return failure(
        403,
        submissionErrorCodes.notEnrolled,
        'You are not enrolled in this course',
      );
    }

    // 4. 마감일 검증
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isLate = now > dueDate;

    if (isLate && !assignment.allow_late) {
      return failure(
        403,
        submissionErrorCodes.pastDueNotAllowed,
        'The submission deadline has passed',
      );
    }

    // 5. 기존 제출물 조회
    const { data: existingSubmissions } = await client
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('learner_id', learnerId)
      .order('submitted_at', { ascending: false })
      .limit(1);

    const hasExistingSubmission =
      existingSubmissions && existingSubmissions.length > 0;

    // 재제출 검증
    if (hasExistingSubmission && !assignment.allow_resubmission) {
      return failure(
        403,
        submissionErrorCodes.resubmissionNotAllowed,
        'Resubmission is not allowed for this assignment',
      );
    }

    // 6. 제출물 생성/업데이트
    const submissionData = {
      assignment_id: assignmentId,
      learner_id: learnerId,
      text: data.text,
      link: data.link || null,
      status: 'submitted' as const,
      late: isLate,
      submitted_at: now.toISOString(),
    };

    let submissionId: string;

    if (hasExistingSubmission && assignment.allow_resubmission) {
      // 재제출: 기존 제출물 업데이트
      const { data: updatedSubmission, error: updateError } = await client
        .from('submissions')
        .update(submissionData)
        .eq('id', existingSubmissions[0].id)
        .select('id')
        .single();

      if (updateError || !updatedSubmission) {
        return failure(
          500,
          submissionErrorCodes.createError,
          'Failed to update submission',
        );
      }

      submissionId = updatedSubmission.id;
    } else {
      // 신규 제출
      const { data: newSubmission, error: createError } = await client
        .from('submissions')
        .insert(submissionData)
        .select('id')
        .single();

      if (createError || !newSubmission) {
        return failure(
          500,
          submissionErrorCodes.createError,
          'Failed to create submission',
        );
      }

      submissionId = newSubmission.id;
    }

    // 7. 생성/업데이트된 제출물 조회
    const { data: submission, error: fetchError } = await client
      .from('submissions')
      .select(
        `
        id,
        text,
        link,
        status,
        late,
        submitted_at,
        grades (
          score,
          feedback,
          graded_at
        )
      `,
      )
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        'Failed to fetch created submission',
      );
    }

    const grade = Array.isArray(submission.grades)
      ? submission.grades[0]
      : submission.grades;

    const historyItem: SubmissionHistoryItem = {
      id: submission.id,
      text: submission.text,
      link: submission.link,
      status: submission.status,
      late: submission.late,
      submittedAt: submission.submitted_at,
      grade: grade
        ? {
            score: grade.score,
            feedback: grade.feedback,
            gradedAt: grade.graded_at,
          }
        : null,
    };

    return success(historyItem);
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.createError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getPendingSubmissionsCount = async (
  client: SupabaseClient,
  instructorId: string,
): Promise<HandlerResult<number, SubmissionServiceError, unknown>> => {
  try {
    const { data: courses, error: coursesError } = await client
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      return failure(500, submissionErrorCodes.fetchError, coursesError.message);
    }

    if (!courses || courses.length === 0) {
      return success(0);
    }

    const courseIds = courses.map((c) => c.id);

    const { data: assignments, error: assignmentsError } = await client
      .from('assignments')
      .select('id')
      .in('course_id', courseIds);

    if (assignmentsError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        assignmentsError.message,
      );
    }

    if (!assignments || assignments.length === 0) {
      return success(0);
    }

    const assignmentIds = assignments.map((a) => a.id);

    const { count, error: submissionsError } = await client
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('assignment_id', assignmentIds)
      .eq('status', 'submitted');

    if (submissionsError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        submissionsError.message,
      );
    }

    return success(count ?? 0);
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getRecentSubmissions = async (
  client: SupabaseClient,
  instructorId: string,
  limit: number = 5,
): Promise<
  HandlerResult<RecentSubmission[], SubmissionServiceError, unknown>
> => {
  try {
    const { data: courses, error: coursesError } = await client
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      return failure(500, submissionErrorCodes.fetchError, coursesError.message);
    }

    if (!courses || courses.length === 0) {
      return success([]);
    }

    const courseIds = courses.map((c) => c.id);

    const { data: assignments, error: assignmentsError } = await client
      .from('assignments')
      .select('id, title, due_date')
      .in('course_id', courseIds);

    if (assignmentsError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        assignmentsError.message,
      );
    }

    if (!assignments || assignments.length === 0) {
      return success([]);
    }

    const assignmentIds = assignments.map((a) => a.id);
    const assignmentMap = new Map(
      assignments.map((a) => [a.id, { title: a.title, dueDate: a.due_date }]),
    );

    const { data: submissions, error: submissionsError } = await client
      .from('submissions')
      .select(
        `
        id,
        assignment_id,
        learner_id,
        submitted_at
      `,
      )
      .in('assignment_id', assignmentIds)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    if (submissionsError) {
      return failure(
        500,
        submissionErrorCodes.fetchError,
        submissionsError.message,
      );
    }

    if (!submissions || submissions.length === 0) {
      return success([]);
    }

    const learnerIds = [...new Set(submissions.map((s) => s.learner_id))];
    const { data: profiles } = await client
      .from('profiles')
      .select('user_id, name')
      .in('user_id', learnerIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p.name]),
    );

    const recentSubmissions: RecentSubmission[] = submissions.map((s) => {
      const assignment = assignmentMap.get(s.assignment_id);
      const learnerName = profileMap.get(s.learner_id) ?? 'Unknown Learner';
      const submittedAt = new Date(s.submitted_at);
      const dueDate = assignment ? new Date(assignment.dueDate) : null;
      const isLate = dueDate ? submittedAt > dueDate : false;

      return {
        submissionId: s.id,
        assignmentTitle: assignment?.title ?? 'Unknown Assignment',
        learnerName,
        submittedAt: s.submitted_at,
        isLate,
      };
    });

    return success(recentSubmissions);
  } catch (error) {
    return failure(
      500,
      submissionErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};
