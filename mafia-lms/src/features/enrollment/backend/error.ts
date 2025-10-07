export const enrollmentErrorCodes = {
  alreadyEnrolled: 'ALREADY_ENROLLED',
  notEnrolled: 'NOT_ENROLLED',
  courseNotPublished: 'COURSE_NOT_PUBLISHED',
  enrollmentFailed: 'ENROLLMENT_FAILED',
  unenrollmentFailed: 'UNENROLLMENT_FAILED',
  invalidRole: 'INVALID_ROLE',
  courseNotFound: 'COURSE_NOT_FOUND',
} as const;

export type EnrollmentServiceError =
  (typeof enrollmentErrorCodes)[keyof typeof enrollmentErrorCodes];
