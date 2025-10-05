export const UserRole = {
  LEARNER: 'learner',
  INSTRUCTOR: 'instructor',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
