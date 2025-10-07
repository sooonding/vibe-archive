export const assignmentErrorCodes = {
  fetchError: 'ASSIGNMENT_FETCH_ERROR',
  validationError: 'ASSIGNMENT_VALIDATION_ERROR',
  assignmentNotFound: 'ASSIGNMENT_NOT_FOUND',
  notEnrolled: 'NOT_ENROLLED',
  notPublished: 'NOT_PUBLISHED',
  courseNotFound: 'COURSE_NOT_FOUND',
  notOwner: 'ASSIGNMENT_NOT_OWNER',
  invalidStatus: 'ASSIGNMENT_INVALID_STATUS',
  hasSubmissions: 'ASSIGNMENT_HAS_SUBMISSIONS',
  createError: 'ASSIGNMENT_CREATE_ERROR',
  updateError: 'ASSIGNMENT_UPDATE_ERROR',
  deleteError: 'ASSIGNMENT_DELETE_ERROR',
} as const;

export type AssignmentServiceError =
  (typeof assignmentErrorCodes)[keyof typeof assignmentErrorCodes];
