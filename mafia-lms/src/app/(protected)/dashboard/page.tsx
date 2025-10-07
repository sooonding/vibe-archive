"use client";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserRole } from "@/features/auth/hooks/useUserRole";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { MyCoursesSection } from "@/features/dashboard/components/my-courses-section";
import { UpcomingAssignmentsSection } from "@/features/dashboard/components/upcoming-assignments-section";
import { RecentFeedbackSection } from "@/features/dashboard/components/recent-feedback-section";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function DashboardPage({ params }: DashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const router = useRouter();
  const { data: roleData, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && roleData?.role === 'instructor') {
      router.replace('/dashboard/instructor');
    }
  }, [roleData, roleLoading, router]);

  // Don't load learner dashboard data if user is instructor
  const shouldLoadDashboard = !roleLoading && roleData?.role === 'learner';
  const { data, isLoading, error } = useDashboard({
    enabled: shouldLoadDashboard,
  });

  // Show loading state while checking role or redirecting instructor
  if (roleLoading || (roleData?.role === 'instructor')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching learner dashboard data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center min-h-[400px] flex items-center justify-center">
            <div>
              <p className="text-red-400 mb-2">에러 발생</p>
              <p className="text-slate-300 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
        <header className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">대시보드</h1>
              <p className="text-slate-300 mt-2">
                {user?.email ?? "알 수 없는 사용자"} 님, 환영합니다.
              </p>
            </div>
            <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
              <Link href="/grades" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                성적 & 피드백
              </Link>
            </Button>
          </div>
        </header>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold mb-4">내 코스</h2>
          <MyCoursesSection courses={data.enrolledCourses} />
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold mb-4">마감 임박 과제</h2>
          <UpcomingAssignmentsSection assignments={data.upcomingAssignments} />
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold mb-4">최근 피드백</h2>
          <RecentFeedbackSection feedback={data.recentFeedback} />
        </section>
      </div>
    </main>
  );
}
