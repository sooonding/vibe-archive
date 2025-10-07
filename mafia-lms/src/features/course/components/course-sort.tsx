'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CourseSortProps {
  sortBy?: string;
  sortOrder?: string;
  onSortChange: (sortBy: string | undefined, sortOrder: string | undefined) => void;
}

const SORT_OPTIONS = [
  { value: 'default', label: '기본 정렬' },
  { value: 'title-asc', label: '제목 (가나다순)' },
  { value: 'title-desc', label: '제목 (역순)' },
  { value: 'category-asc', label: '카테고리 (가나다순)' },
  { value: 'category-desc', label: '카테고리 (역순)' },
  { value: 'difficulty-asc', label: '난이도 (낮은순)' },
  { value: 'difficulty-desc', label: '난이도 (높은순)' },
  { value: 'created_at-asc', label: '생성일 (오래된순)' },
  { value: 'created_at-desc', label: '생성일 (최신순)' },
];

export const CourseSort = ({ sortBy, sortOrder, onSortChange }: CourseSortProps) => {
  const currentValue = sortBy && sortOrder ? `${sortBy}-${sortOrder}` : 'default';

  const handleSortChange = (value: string) => {
    if (value === 'default') {
      onSortChange(undefined, undefined);
    } else {
      const [newSortBy, newSortOrder] = value.split('-');
      onSortChange(newSortBy, newSortOrder);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sort-select">정렬</Label>
      <Select value={currentValue} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select">
          <SelectValue placeholder="정렬 방식 선택" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
