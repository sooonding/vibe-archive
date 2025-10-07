export const submissionErrorCodes = {
  fetchError: 'SUBMISSION_FETCH_ERROR',
  validationError: 'SUBMISSION_VALIDATION_ERROR',
  assignmentNotFound: 'SUBMISSION_ASSIGNMENT_NOT_FOUND',
  assignmentClosed: 'SUBMISSION_ASSIGNMENT_CLOSED',
  pastDueNotAllowed: 'SUBMISSION_PAST_DUE_NOT_ALLOWED',
  resubmissionNotAllowed: 'SUBMISSION_RESUBMISSION_NOT_ALLOWED',
  notEnrolled: 'SUBMISSION_NOT_ENROLLED',
  createError: 'SUBMISSION_CREATE_ERROR',
} as const;

export type SubmissionServiceError =
  (typeof submissionErrorCodes)[keyof typeof submissionErrorCodes];
