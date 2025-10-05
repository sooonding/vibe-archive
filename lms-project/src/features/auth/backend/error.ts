export const authErrorCodes = {
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  invalidCredentials: 'INVALID_CREDENTIALS',
  invalidRequest: 'INVALID_REQUEST',
  signupFailed: 'SIGNUP_FAILED',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  termsAgreementFailed: 'TERMS_AGREEMENT_FAILED',
  validationError: 'VALIDATION_ERROR',
} as const;

type AuthErrorValue = (typeof authErrorCodes)[keyof typeof authErrorCodes];

export type AuthServiceError = AuthErrorValue;
