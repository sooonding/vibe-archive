export const gradeErrorCodes = {
  fetchError: 'FETCH_ERROR',
  invalidRole: 'INVALID_ROLE',
  notEnrolled: 'NOT_ENROLLED',
  submissionNotFound: 'SUBMISSION_NOT_FOUND',
  notCourseOwner: 'NOT_COURSE_OWNER',
  alreadyGraded: 'ALREADY_GRADED',
  invalidScore: 'INVALID_SCORE',
  gradeError: 'GRADE_ERROR',
  resubmitError: 'RESUBMIT_ERROR',
} as const;

export type GradeErrorCode =
  (typeof gradeErrorCodes)[keyof typeof gradeErrorCodes];

export interface GradeServiceError {
  code: GradeErrorCode;
  message: string;
}
