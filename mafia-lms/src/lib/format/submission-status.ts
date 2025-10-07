export const formatSubmissionStatus = (
  status: 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required',
): string => {
  const statusMap = {
    not_submitted: '미제출',
    submitted: '채점 대기',
    graded: '채점 완료',
    resubmission_required: '재제출 필요',
  };

  return statusMap[status];
};

export const getSubmissionStatusColor = (
  status: 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required',
): string => {
  const colorMap = {
    not_submitted: 'text-gray-500',
    submitted: 'text-blue-500',
    graded: 'text-green-500',
    resubmission_required: 'text-orange-500',
  };

  return colorMap[status];
};
