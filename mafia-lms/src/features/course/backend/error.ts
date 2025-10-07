export const courseErrorCodes = {
  fetchError: 'FETCH_ERROR',
  validationError: 'VALIDATION_ERROR',
  courseNotFound: 'COURSE_NOT_FOUND',
  createError: 'CREATE_ERROR',
  updateError: 'UPDATE_ERROR',
  unauthorizedAccess: 'UNAUTHORIZED_ACCESS',
  invalidStatusTransition: 'INVALID_STATUS_TRANSITION',
  cannotDeleteWithEnrollments: 'CANNOT_DELETE_WITH_ENROLLMENTS',
  invalidRole: 'INVALID_ROLE',
} as const;

export type CourseServiceError =
  (typeof courseErrorCodes)[keyof typeof courseErrorCodes];
