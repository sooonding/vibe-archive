export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  [COURSE_STATUS.DRAFT]: 'Draft',
  [COURSE_STATUS.PUBLISHED]: 'Published',
  [COURSE_STATUS.ARCHIVED]: 'Archived',
};

export const COURSE_STATUS_LABELS_KO: Record<CourseStatus, string> = {
  [COURSE_STATUS.DRAFT]: '작성 중',
  [COURSE_STATUS.PUBLISHED]: '공개',
  [COURSE_STATUS.ARCHIVED]: '보관',
};

export const COURSE_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

export type CourseDifficulty = (typeof COURSE_DIFFICULTY)[keyof typeof COURSE_DIFFICULTY];

export const COURSE_DIFFICULTY_LABELS: Record<CourseDifficulty, string> = {
  [COURSE_DIFFICULTY.BEGINNER]: 'Beginner',
  [COURSE_DIFFICULTY.INTERMEDIATE]: 'Intermediate',
  [COURSE_DIFFICULTY.ADVANCED]: 'Advanced',
};

export const COURSE_DIFFICULTY_LABELS_KO: Record<CourseDifficulty, string> = {
  [COURSE_DIFFICULTY.BEGINNER]: '초급',
  [COURSE_DIFFICULTY.INTERMEDIATE]: '중급',
  [COURSE_DIFFICULTY.ADVANCED]: '고급',
};
