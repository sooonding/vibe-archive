'use client';

import { Badge } from '@/components/ui/badge';
import { COURSE_STATUS_LABELS_KO, type CourseStatus } from '@/constants/course';

interface CourseStatusBadgeProps {
  status: CourseStatus;
}

export function CourseStatusBadge({ status }: CourseStatusBadgeProps) {
  const getVariant = (status: CourseStatus) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'published':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {COURSE_STATUS_LABELS_KO[status]}
    </Badge>
  );
}
