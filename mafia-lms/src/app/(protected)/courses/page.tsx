'use client';

import { CourseList } from '@/features/course/components/course-list';

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">코스 목록</h1>
        <CourseList />
      </div>
    </main>
  );
}
