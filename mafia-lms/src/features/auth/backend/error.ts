export const authErrorCodes = {
  signupFailed: 'SIGNUP_FAILED',
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  invalidInput: 'INVALID_INPUT',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  termsAcceptanceFailed: 'TERMS_ACCEPTANCE_FAILED',
  fetchError: 'AUTH_FETCH_ERROR',
} as const;

export type AuthServiceError =
  (typeof authErrorCodes)[keyof typeof authErrorCodes];
