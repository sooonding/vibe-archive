'use client';

import { Badge } from '@/components/ui/badge';
import {
  ASSIGNMENT_STATUS_LABELS_KO,
  type AssignmentStatus,
} from '@/constants/assignment';

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  const variantMap: Record<
    AssignmentStatus,
    'default' | 'secondary' | 'destructive'
  > = {
    draft: 'secondary',
    published: 'default',
    closed: 'destructive',
  };

  return (
    <Badge variant={variantMap[status]}>
      {ASSIGNMENT_STATUS_LABELS_KO[status]}
    </Badge>
  );
}
