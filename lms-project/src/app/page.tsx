"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { UserRole } from "@/types/user";

const features = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "다양한 코스",
    description: "개발, 디자인, 비즈니스 등 다양한 분야의 전문 강의",
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "전문 강사진",
    description: "현업 전문가들의 실무 중심 강의",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "커뮤니티",
    description: "함께 배우고 성장하는 학습 커뮤니티",
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "체계적인 학습",
    description: "과제와 피드백을 통한 실력 향상",
  },
];

export default function Home() {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      if (user.role === UserRole.LEARNER) {
        router.replace("/courses");
      } else if (user.role === UserRole.INSTRUCTOR) {
        router.replace("/instructor/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-md bg-white/20" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-white/20" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <Link href="/login">로그인</Link>
        </Button>
        <Button
          asChild
          className="bg-white text-purple-600 hover:bg-white/90"
        >
          <Link href="/signup">회원가입</Link>
        </Button>
      </div>
    );
  }, [isAuthenticated, isLoading, user]);

  if (isAuthenticated && user && user.role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        <div className="text-center text-white">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto" />
          <p className="text-xl">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">LMS Platform</span>
          </div>
          {authActions}
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-16 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              배움의 즐거움을
              <br />
              경험하세요
            </h1>
            <p className="max-w-2xl text-xl text-white/90 md:text-2xl">
              전문 강사진과 함께하는 체계적인 온라인 학습 플랫폼
            </p>
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white px-8 text-lg text-purple-600 hover:bg-white/90"
              >
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 px-8 text-lg text-white hover:bg-white/20"
              >
                <Link href="/login">로그인</Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <CardHeader>
                  <div className="mb-2 text-white/90">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-white/80">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <footer className="rounded-2xl bg-white/10 px-6 py-4 text-center text-sm text-white/80 backdrop-blur-sm">
          <p>© 2025 LMS Platform. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
