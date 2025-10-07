'use client';

import { getProgressColor } from '@/lib/utils/progress';

interface ProgressBarProps {
  progress: number;
  total: number;
  completed: number;
}

export const ProgressBar = ({ progress, total, completed }: ProgressBarProps) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {completed}/{total} 완료
        </span>
        <span className={getProgressColor(progress)}>{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
