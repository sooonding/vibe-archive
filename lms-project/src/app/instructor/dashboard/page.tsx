"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type InstructorDashboardPageProps = {
  params: Promise<Record<string, never>>;
};

const stats = [
  {
    title: "전체 코스",
    value: "12",
    icon: <BookOpen className="h-6 w-6" />,
    description: "+2 이번 달",
    trend: "up",
  },
  {
    title: "전체 수강생",
    value: "1,234",
    icon: <Users className="h-6 w-6" />,
    description: "+128 이번 달",
    trend: "up",
  },
  {
    title: "미채점 과제",
    value: "23",
    icon: <ClipboardList className="h-6 w-6" />,
    description: "확인 필요",
    trend: "neutral",
  },
  {
    title: "평균 평점",
    value: "4.8",
    icon: <TrendingUp className="h-6 w-6" />,
    description: "5점 만점",
    trend: "up",
  },
];

const recentCourses = [
  {
    id: "1",
    title: "React와 TypeScript로 만드는 현대적인 웹 애플리케이션",
    students: 345,
    status: "published",
    lastUpdated: "2일 전",
  },
  {
    id: "2",
    title: "Node.js와 Express로 백엔드 개발하기",
    students: 287,
    status: "published",
    lastUpdated: "1주 전",
  },
  {
    id: "3",
    title: "Next.js 완벽 가이드",
    students: 0,
    status: "draft",
    lastUpdated: "방금",
  },
];

const recentSubmissions = [
  {
    id: "1",
    student: "김학생",
    course: "React 웹 개발",
    assignment: "Todo 앱 만들기",
    submittedAt: "2시간 전",
    status: "submitted",
  },
  {
    id: "2",
    student: "이수강",
    course: "Node.js 백엔드",
    assignment: "REST API 구현",
    submittedAt: "5시간 전",
    status: "submitted",
  },
  {
    id: "3",
    student: "박개발",
    course: "React 웹 개발",
    assignment: "상태 관리 구현",
    submittedAt: "1일 전",
    status: "submitted",
  },
];

export default function InstructorDashboardPage({
  params,
}: InstructorDashboardPageProps) {
  void params;
  const { user } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-slate-900">
              LMS Platform
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Badge className="bg-purple-100 text-purple-700">강사</Badge>
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
            <p className="mt-1 text-slate-600">
              강의 현황을 한눈에 확인하세요
            </p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Plus className="mr-2 h-4 w-4" />
            새 코스 만들기
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className="text-purple-600">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <p
                  className={`mt-1 text-xs ${
                    stat.trend === "up"
                      ? "text-emerald-600"
                      : "text-slate-500"
                  }`}
                >
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 코스</CardTitle>
              <CardDescription>최근 업데이트된 코스 목록</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students}명
                      </span>
                      <span>{course.lastUpdated}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      course.status === "published" ? "default" : "secondary"
                    }
                  >
                    {course.status === "published" ? "게시됨" : "임시저장"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 제출물</CardTitle>
              <CardDescription>채점 대기 중인 과제</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-start justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {submission.student}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {submission.course}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {submission.assignment}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {submission.submittedAt}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    채점하기
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
