export const courseErrorCodes = {
  fetchError: 'FETCH_ERROR',
  validationError: 'VALIDATION_ERROR',
} as const;

export type CourseServiceError =
  (typeof courseErrorCodes)[keyof typeof courseErrorCodes];
