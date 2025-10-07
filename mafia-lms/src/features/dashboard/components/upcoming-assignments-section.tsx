'use client';

import { AssignmentCard } from './assignment-card';
import type { UpcomingAssignment } from '../dto';

interface UpcomingAssignmentsSectionProps {
  assignments: UpcomingAssignment[];
}

export const UpcomingAssignmentsSection = ({
  assignments,
}: UpcomingAssignmentsSectionProps) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">마감 임박한 과제가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
};
