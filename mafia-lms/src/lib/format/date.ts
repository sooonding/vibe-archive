import { formatDistanceToNow, formatDistanceToNowStrict, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: ko,
  });
};

export const formatDueTime = (dueDate: string): string => {
  const distance = formatDistanceToNowStrict(new Date(dueDate), {
    locale: ko,
  });
  return `${distance} 후`;
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
};
