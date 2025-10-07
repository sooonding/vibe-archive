'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CourseFilterProps {
  category?: string;
  difficulty?: string;
  onCategoryChange: (category: string | undefined) => void;
  onDifficultyChange: (difficulty: string | undefined) => void;
}

const CATEGORIES = [
  { value: 'all', label: '전체 카테고리' },
  { value: 'programming', label: '프로그래밍' },
  { value: 'design', label: '디자인' },
  { value: 'business', label: '비즈니스' },
  { value: 'marketing', label: '마케팅' },
];

const DIFFICULTIES = [
  { value: 'all', label: '전체 난이도' },
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
];

export const CourseFilter = ({
  category,
  difficulty,
  onCategoryChange,
  onDifficultyChange,
}: CourseFilterProps) => {
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value === 'all' ? undefined : value);
  };

  const handleDifficultyChange = (value: string) => {
    onDifficultyChange(value === 'all' ? undefined : value);
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="category-filter">카테고리</Label>
        <Select
          value={category || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label htmlFor="difficulty-filter">난이도</Label>
        <Select
          value={difficulty || 'all'}
          onValueChange={handleDifficultyChange}
        >
          <SelectTrigger id="difficulty-filter">
            <SelectValue placeholder="난이도 선택" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((diff) => (
              <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
