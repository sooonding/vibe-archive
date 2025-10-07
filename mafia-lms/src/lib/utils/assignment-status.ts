export const canSubmit = (assignment: {
  status?: string;
  dueDate?: string;
  allowLate?: boolean;
}): boolean => {
  if (!assignment.status || !assignment.dueDate) return false;
  if (assignment.status === 'closed') return false;
  if (assignment.status !== 'published') return false;

  const now = new Date();
  const due = new Date(assignment.dueDate);

  if (now <= due) return true;
  return assignment.allowLate ?? false;
};

export const canResubmit = (
  assignment: { allowResubmission?: boolean },
  submission: { status?: string } | null,
): boolean => {
  if (!submission || !submission.status) return false;
  return (
    (assignment.allowResubmission ?? false) &&
    submission.status === 'resubmission_required'
  );
};

export const getSubmissionStatus = (
  assignment: { id: string },
  submissions: { assignmentId: string; status: string }[],
):
  | 'not_submitted'
  | 'submitted'
  | 'graded'
  | 'resubmission_required' => {
  const submission = submissions.find((s) => s.assignmentId === assignment.id);
  if (!submission) return 'not_submitted';

  if (submission.status === 'graded') return 'graded';
  if (submission.status === 'resubmission_required')
    return 'resubmission_required';
  return 'submitted';
};

export const canPublishAssignment = (assignment: {
  title?: string;
  description?: string;
  dueDate?: string;
  weight?: number;
}): { allowed: boolean; reason?: string } => {
  if (!assignment.title || assignment.title.trim() === '') {
    return { allowed: false, reason: '제목을 입력해주세요' };
  }
  if (!assignment.description || assignment.description.trim() === '') {
    return { allowed: false, reason: '설명을 입력해주세요' };
  }
  if (!assignment.dueDate) {
    return { allowed: false, reason: '마감일을 입력해주세요' };
  }
  if (
    assignment.weight === undefined ||
    assignment.weight < 0 ||
    assignment.weight > 100
  ) {
    return { allowed: false, reason: '점수 비중을 0~100 사이로 입력해주세요' };
  }
  return { allowed: true };
};

export const getNextAllowedAssignmentStatuses = (
  currentStatus: string,
): string[] => {
  const validTransitions: Record<string, string[]> = {
    draft: ['published'],
    published: ['closed'],
    closed: [],
  };
  return validTransitions[currentStatus] || [];
};
