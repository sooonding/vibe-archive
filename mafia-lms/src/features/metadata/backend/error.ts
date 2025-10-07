export const metadataErrorCodes = {
  fetchError: 'FETCH_ERROR',
  metadataNotFound: 'METADATA_NOT_FOUND',
  duplicateName: 'DUPLICATE_NAME',
  createError: 'CREATE_ERROR',
  updateError: 'UPDATE_ERROR',
  validationError: 'VALIDATION_ERROR',
  inUseCannotDelete: 'IN_USE_CANNOT_DELETE',
} as const;

export type MetadataServiceError =
  (typeof metadataErrorCodes)[keyof typeof metadataErrorCodes];
