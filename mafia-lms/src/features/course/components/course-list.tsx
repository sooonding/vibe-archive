"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import { CourseCard } from "./course-card";
import { Button } from "@/components/ui/button";

export const CourseList = () => {
  const { data: courses, isLoading, error, refetch } = useCourses();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-sm text-slate-600">코스 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-6">
          <AlertCircle className="h-8 w-8 text-rose-600" />
          <p className="text-sm font-medium text-rose-900">
            코스 목록을 불러오는데 실패했습니다
          </p>
          <p className="text-xs text-rose-700">
            {error instanceof Error ? error.message : "알 수 없는 오류"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-2"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-600">
            현재 공개된 코스가 없습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
