"use client";

import { useCallback, useState } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CourseList } from "@/features/course/components/course-list";
import { CourseSearch } from "@/features/course/components/course-search";
import { CourseFilter } from "@/features/course/components/course-filter";
import { CourseSort } from "@/features/course/components/course-sort";
import { Header } from "@/components/layout/header";
import type { CourseQueryParams } from "@/features/course/lib/dto";

export default function Home() {
  const { isAuthenticated } = useCurrentUser();
  const [queryParams, setQueryParams] = useState<CourseQueryParams>({});

  const handleSearch = useCallback((searchTerm: string) => {
    setQueryParams((prev) => ({
      ...prev,
      search: searchTerm || undefined,
    }));
  }, []);

  const handleCategoryChange = useCallback((category: string | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      category,
    }));
  }, []);

  const handleDifficultyChange = useCallback((difficulty: string | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      difficulty,
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string | undefined, sortOrder: string | undefined) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy as 'title' | 'category' | 'difficulty' | 'created_at' | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    }));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8">
        <Header />

        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            코스 카탈로그
          </h1>
          <p className="max-w-3xl text-base text-slate-300 md:text-lg">
            전문가들이 준비한 다양한 코스를 만나보세요.
            <br />
            {isAuthenticated
              ? "관심있는 코스를 클릭하여 자세히 알아보세요."
              : "로그인하여 코스 상세 정보를 확인하고 수강 신청하세요."}
          </p>
        </header>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 space-y-6">
          <div className="space-y-4">
            <CourseSearch
              onSearch={handleSearch}
              defaultValue={queryParams.search}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseFilter
                category={queryParams.category}
                difficulty={queryParams.difficulty}
                onCategoryChange={handleCategoryChange}
                onDifficultyChange={handleDifficultyChange}
              />
              <CourseSort
                sortBy={queryParams.sortBy}
                sortOrder={queryParams.sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
          <CourseList queryParams={queryParams} />
        </section>
      </div>
    </main>
  );
}
