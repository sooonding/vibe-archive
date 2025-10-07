'use client';

interface PendingSubmissionsSectionProps {
  count: number;
}

export const PendingSubmissionsSection = ({
  count,
}: PendingSubmissionsSectionProps) => {
  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-br from-orange-950 to-orange-900 rounded-lg border border-orange-800">
      <div>
        <h3 className="text-lg font-semibold text-white">
          채점 대기 중인 제출물
        </h3>
        <p className="text-sm text-orange-200 mt-1">
          {count === 0 ? '모두 채점 완료했습니다' : '확인이 필요합니다'}
        </p>
      </div>
      <div className="text-4xl font-bold text-orange-400">{count}</div>
    </div>
  );
};
