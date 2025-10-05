"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { CourseList } from "@/features/course/components/course-list";

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return (
        <span className="text-sm text-slate-300">세션 확인 중...</span>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="truncate">{user.email ?? "알 수 없는 사용자"}</span>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border border-slate-600 px-3 py-1 transition hover:border-slate-400 hover:bg-slate-800"
            >
              대시보드
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8">
        <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span>Mafia LMS</span>
          </div>
          {authActions}
        </div>

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

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <CourseList />
        </section>
      </div>
    </main>
  );
}
