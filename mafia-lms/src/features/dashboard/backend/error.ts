export const dashboardErrorCodes = {
  fetchError: 'DASHBOARD_FETCH_ERROR',
  invalidRole: 'INVALID_ROLE',
  notEnrolled: 'NO_ENROLLMENTS',
} as const;

export type DashboardServiceError =
  (typeof dashboardErrorCodes)[keyof typeof dashboardErrorCodes];
