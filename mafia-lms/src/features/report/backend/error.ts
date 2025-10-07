export const reportErrorCodes = {
  fetchError: 'FETCH_ERROR',
  reportNotFound: 'REPORT_NOT_FOUND',
  invalidStatusTransition: 'INVALID_STATUS_TRANSITION',
  actionError: 'ACTION_ERROR',
  alreadyResolved: 'ALREADY_RESOLVED',
  targetNotFound: 'TARGET_NOT_FOUND',
  validationError: 'VALIDATION_ERROR',
  createError: 'CREATE_ERROR',
  updateError: 'UPDATE_ERROR',
} as const;

export type ReportServiceError =
  (typeof reportErrorCodes)[keyof typeof reportErrorCodes];
