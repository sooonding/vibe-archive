import { COURSE_STATUS, type CourseStatus } from '@/constants/course';

export const canTransitionToStatus = (
  currentStatus: CourseStatus,
  newStatus: CourseStatus,
  enrolledCount: number,
): { allowed: boolean; reason?: string } => {
  if (currentStatus === newStatus) {
    return { allowed: true };
  }

  // draft → archived 불가
  if (currentStatus === COURSE_STATUS.DRAFT && newStatus === COURSE_STATUS.ARCHIVED) {
    return {
      allowed: false,
      reason: 'Draft 코스는 직접 Archived로 전환할 수 없습니다',
    };
  }

  // published → draft (수강생 있음) 불가
  if (
    currentStatus === COURSE_STATUS.PUBLISHED &&
    newStatus === COURSE_STATUS.DRAFT &&
    enrolledCount > 0
  ) {
    return {
      allowed: false,
      reason: '수강생이 있는 코스는 Draft로 전환할 수 없습니다',
    };
  }

  // archived → draft 불가
  if (currentStatus === COURSE_STATUS.ARCHIVED && newStatus === COURSE_STATUS.DRAFT) {
    return {
      allowed: false,
      reason: 'Archived 코스는 Draft로 전환할 수 없습니다',
    };
  }

  return { allowed: true };
};

export const getNextAllowedStatuses = (
  currentStatus: CourseStatus,
  enrolledCount: number,
): CourseStatus[] => {
  const allStatuses = Object.values(COURSE_STATUS);
  return allStatuses.filter((status) => {
    const { allowed } = canTransitionToStatus(currentStatus, status, enrolledCount);
    return allowed && status !== currentStatus;
  });
};
