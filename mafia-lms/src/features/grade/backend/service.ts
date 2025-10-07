import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import { gradeErrorCodes, type GradeErrorCode } from './error';
import type {
  AssignmentGrade,
  CourseGrade,
  MyGradesResponse,
  SubmissionDetail,
  GradeSubmissionRequest,
  GradeSubmissionResponse,
} from './schema';

export const getMyGrades = async (
  client: SupabaseClient,
  learnerId: string,
): Promise<HandlerResult<MyGradesResponse, GradeErrorCode, unknown>> => {
  try {
    // 1. Check user role
    const { data: user, error: userError } = await client
      .from('users')
      .select('role')
      .eq('id', learnerId)
      .single();

    if (userError) {
      return failure(500, gradeErrorCodes.fetchError, userError.message);
    }

    if (user.role !== 'learner') {
      return failure(
        403,
        gradeErrorCodes.invalidRole,
        'Only learners can access grades',
      );
    }

    // 2. Get enrolled courses
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select(
        `
        course_id,
        courses!inner (
          id,
          title
        )
      `,
      )
      .eq('learner_id', learnerId);

    if (enrollmentError) {
      return failure(
        500,
        gradeErrorCodes.fetchError,
        enrollmentError.message,
      );
    }

    if (!enrollments || enrollments.length === 0) {
      return success({ courses: [] });
    }

    const courseGrades: CourseGrade[] = [];

    // 3. For each course, get assignments and submissions
    for (const enrollment of enrollments) {
      const course = enrollment.courses as any;

      // Get all published assignments for this course
      const { data: assignments, error: assignmentError } = await client
        .from('assignments')
        .select('id, title, weight')
        .eq('course_id', course.id)
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (assignmentError) {
        continue;
      }

      if (!assignments || assignments.length === 0) {
        courseGrades.push({
          courseId: course.id,
          courseName: course.title,
          totalScore: 0,
          maxScore: 100,
          assignments: [],
        });
        continue;
      }

      const assignmentGrades: AssignmentGrade[] = [];
      const gradedScores: { score: number; weight: number }[] = [];

      // For each assignment, get submission and grade
      for (const assignment of assignments) {
        const { data: submissions, error: submissionError } = await client
          .from('submissions')
          .select(
            `
            id,
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
          .eq('assignment_id', assignment.id)
          .eq('learner_id', learnerId)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (submissionError || !submissions || submissions.length === 0) {
          // Not submitted
          assignmentGrades.push({
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            weight: assignment.weight,
            submissionStatus: 'not_submitted',
            score: null,
            feedback: null,
            late: false,
            submittedAt: null,
            gradedAt: null,
          });
          continue;
        }

        const submission = submissions[0] as any;
        const grade = Array.isArray(submission.grades)
          ? submission.grades[0]
          : submission.grades;

        const submissionStatus = submission.status as
          | 'submitted'
          | 'graded'
          | 'resubmission_required';

        assignmentGrades.push({
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          weight: assignment.weight,
          submissionStatus,
          score: grade?.score ?? null,
          feedback: grade?.feedback ?? null,
          late: submission.late,
          submittedAt: submission.submitted_at,
          gradedAt: grade?.graded_at ?? null,
        });

        // Add to graded scores if graded or resubmission_required
        if (
          (submissionStatus === 'graded' ||
            submissionStatus === 'resubmission_required') &&
          grade?.score != null
        ) {
          gradedScores.push({
            score: grade.score,
            weight: assignment.weight,
          });
        }
      }

      // Calculate total score
      let totalScore = 0;
      if (gradedScores.length > 0) {
        const totalWeight = gradedScores.reduce(
          (sum, item) => sum + item.weight,
          0,
        );
        if (totalWeight > 0) {
          const weightedSum = gradedScores.reduce(
            (sum, item) => sum + item.score * item.weight,
            0,
          );
          totalScore = weightedSum / totalWeight;
        }
      }

      courseGrades.push({
        courseId: course.id,
        courseName: course.title,
        totalScore,
        maxScore: 100,
        assignments: assignmentGrades,
      });
    }

    return success({ courses: courseGrades });
  } catch (error) {
    return failure(
      500,
      gradeErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const getSubmissionDetail = async (
  client: SupabaseClient,
  submissionId: string,
  instructorId: string,
): Promise<HandlerResult<SubmissionDetail, GradeErrorCode, unknown>> => {
  try {
    const { data: submission, error: submissionError } = await client
      .from('submissions')
      .select(
        `
        id,
        text,
        link,
        status,
        late,
        submitted_at,
        assignment_id,
        learner_id,
        assignments!inner (
          id,
          title,
          course_id,
          courses!inner (
            id,
            title,
            instructor_id
          )
        ),
        grades (
          score,
          feedback,
          graded_at
        )
      `,
      )
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return failure(
        404,
        gradeErrorCodes.submissionNotFound,
        'Submission not found',
      );
    }

    const assignment = submission.assignments as any;
    const course = assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        gradeErrorCodes.notCourseOwner,
        'You are not the owner of this course',
      );
    }

    const { data: profile } = await client
      .from('profiles')
      .select('name')
      .eq('user_id', submission.learner_id)
      .single();

    const grade = Array.isArray(submission.grades)
      ? submission.grades[0]
      : submission.grades;

    const submissionDetail: SubmissionDetail = {
      submissionId: submission.id,
      assignmentTitle: assignment.title,
      courseId: course.id,
      courseName: course.title,
      learnerId: submission.learner_id,
      learnerName: profile?.name || 'Unknown Learner',
      submissionText: submission.text,
      submissionLink: submission.link,
      submittedAt: submission.submitted_at,
      isLate: submission.late,
      status: submission.status,
      currentScore: grade?.score ?? null,
      currentFeedback: grade?.feedback ?? null,
      gradedAt: grade?.graded_at ?? null,
    };

    return success(submissionDetail);
  } catch (error) {
    return failure(
      500,
      gradeErrorCodes.fetchError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const gradeSubmission = async (
  client: SupabaseClient,
  submissionId: string,
  instructorId: string,
  data: GradeSubmissionRequest,
): Promise<HandlerResult<GradeSubmissionResponse, GradeErrorCode, unknown>> => {
  try {
    const { data: submission, error: submissionError } = await client
      .from('submissions')
      .select(
        `
        id,
        assignment_id,
        assignments!inner (
          course_id,
          courses!inner (
            instructor_id
          )
        )
      `,
      )
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return failure(
        404,
        gradeErrorCodes.submissionNotFound,
        'Submission not found',
      );
    }

    const assignment = submission.assignments as any;
    const course = assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        gradeErrorCodes.notCourseOwner,
        'You are not the owner of this course',
      );
    }

    if (data.score < 0 || data.score > 100) {
      return failure(
        400,
        gradeErrorCodes.invalidScore,
        'Score must be between 0 and 100',
      );
    }

    const now = new Date().toISOString();

    const { data: existingGrade } = await client
      .from('grades')
      .select('submission_id')
      .eq('submission_id', submissionId)
      .single();

    if (existingGrade) {
      const { error: updateError } = await client
        .from('grades')
        .update({
          score: data.score,
          feedback: data.feedback,
          graded_at: now,
        })
        .eq('submission_id', submissionId);

      if (updateError) {
        return failure(
          500,
          gradeErrorCodes.gradeError,
          'Failed to update grade',
        );
      }
    } else {
      const { error: insertError } = await client.from('grades').insert({
        submission_id: submissionId,
        score: data.score,
        feedback: data.feedback,
        graded_at: now,
      });

      if (insertError) {
        return failure(
          500,
          gradeErrorCodes.gradeError,
          'Failed to create grade',
        );
      }
    }

    const { error: statusError } = await client
      .from('submissions')
      .update({ status: 'graded' })
      .eq('id', submissionId);

    if (statusError) {
      return failure(
        500,
        gradeErrorCodes.gradeError,
        'Failed to update submission status',
      );
    }

    const gradeResponse: GradeSubmissionResponse = {
      submissionId,
      status: 'graded',
      score: data.score,
      feedback: data.feedback,
      gradedAt: now,
    };

    return success(gradeResponse);
  } catch (error) {
    return failure(
      500,
      gradeErrorCodes.gradeError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};

export const requestResubmission = async (
  client: SupabaseClient,
  submissionId: string,
  instructorId: string,
  feedback: string,
): Promise<HandlerResult<GradeSubmissionResponse, GradeErrorCode, unknown>> => {
  try {
    const { data: submission, error: submissionError } = await client
      .from('submissions')
      .select(
        `
        id,
        assignment_id,
        assignments!inner (
          course_id,
          courses!inner (
            instructor_id
          )
        )
      `,
      )
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return failure(
        404,
        gradeErrorCodes.submissionNotFound,
        'Submission not found',
      );
    }

    const assignment = submission.assignments as any;
    const course = assignment.courses;

    if (course.instructor_id !== instructorId) {
      return failure(
        403,
        gradeErrorCodes.notCourseOwner,
        'You are not the owner of this course',
      );
    }

    const now = new Date().toISOString();

    const { data: existingGrade } = await client
      .from('grades')
      .select('submission_id, score')
      .eq('submission_id', submissionId)
      .single();

    if (existingGrade) {
      const { error: updateError } = await client
        .from('grades')
        .update({
          feedback,
          graded_at: now,
        })
        .eq('submission_id', submissionId);

      if (updateError) {
        return failure(
          500,
          gradeErrorCodes.resubmitError,
          'Failed to update feedback',
        );
      }
    } else {
      const { error: insertError } = await client.from('grades').insert({
        submission_id: submissionId,
        score: null,
        feedback,
        graded_at: now,
      });

      if (insertError) {
        return failure(
          500,
          gradeErrorCodes.resubmitError,
          'Failed to create feedback',
        );
      }
    }

    const { error: statusError } = await client
      .from('submissions')
      .update({ status: 'resubmission_required' })
      .eq('id', submissionId);

    if (statusError) {
      return failure(
        500,
        gradeErrorCodes.resubmitError,
        'Failed to update submission status',
      );
    }

    const resubmitResponse: GradeSubmissionResponse = {
      submissionId,
      status: 'graded',
      score: existingGrade?.score ?? 0,
      feedback,
      gradedAt: now,
    };

    return success(resubmitResponse);
  } catch (error) {
    return failure(
      500,
      gradeErrorCodes.resubmitError,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
};
