export const ASSIGNMENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
} as const;

export type AssignmentStatus =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

export const ASSIGNMENT_STATUS_LABELS_KO: Record<AssignmentStatus, string> = {
  [ASSIGNMENT_STATUS.DRAFT]: '작성 중',
  [ASSIGNMENT_STATUS.PUBLISHED]: '게시됨',
  [ASSIGNMENT_STATUS.CLOSED]: '마감됨',
};
