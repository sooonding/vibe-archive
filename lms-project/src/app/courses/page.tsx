"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, GraduationCap, LogOut, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

type CoursesPageProps = {
  params: Promise<Record<string, never>>;
};

const mockCourses = [
  {
    id: "1",
    title: "React와 TypeScript로 만드는 현대적인 웹 애플리케이션",
    instructor: "김개발",
    category: "개발",
    level: "중급",
    price: 39000,
    originalPrice: 99000,
    rating: 4.8,
    reviewCount: 2345,
    thumbnail: "https://picsum.photos/seed/course1/640/360",
    badge: "베스트셀러",
  },
  {
    id: "2",
    title: "Figma를 활용한 UI/UX 디자인 완성",
    instructor: "이디자인",
    category: "디자인",
    level: "초급",
    price: 29000,
    originalPrice: 79000,
    rating: 4.9,
    reviewCount: 1823,
    thumbnail: "https://picsum.photos/seed/course2/640/360",
    badge: "신규",
  },
  {
    id: "3",
    title: "데이터 분석을 위한 Python 마스터",
    instructor: "박데이터",
    category: "데이터 사이언스",
    level: "고급",
    price: 49000,
    originalPrice: 129000,
    rating: 4.7,
    reviewCount: 3421,
    thumbnail: "https://picsum.photos/seed/course3/640/360",
    badge: "인기",
  },
  {
    id: "4",
    title: "비즈니스 성장을 위한 디지털 마케팅",
    instructor: "최마케팅",
    category: "비즈니스",
    level: "초급",
    price: 35000,
    originalPrice: 89000,
    rating: 4.6,
    reviewCount: 1567,
    thumbnail: "https://picsum.photos/seed/course4/640/360",
    badge: "추천",
  },
  {
    id: "5",
    title: "Node.js와 Express로 백엔드 개발하기",
    instructor: "정백엔드",
    category: "개발",
    level: "중급",
    price: 42000,
    originalPrice: 99000,
    rating: 4.8,
    reviewCount: 2891,
    thumbnail: "https://picsum.photos/seed/course5/640/360",
    badge: "베스트셀러",
  },
  {
    id: "6",
    title: "일러스트레이터로 시작하는 그래픽 디자인",
    instructor: "강그래픽",
    category: "디자인",
    level: "초급",
    price: 27000,
    originalPrice: 69000,
    rating: 4.7,
    reviewCount: 1234,
    thumbnail: "https://picsum.photos/seed/course6/640/360",
    badge: "신규",
  },
];

const popularSearches = ["React", "디자인", "Python", "마케팅", "영어"];

export default function CoursesPage({ params }: CoursesPageProps) {
  void params;
  const { user } = useCurrentUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

      <section className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-16">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">무엇을 배우고 싶으세요?</h1>
            <p className="mt-2 text-xl text-white/90">
              전문가들의 수천 개 강의를 둘러보세요
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg shadow-2xl"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-white/80">인기 검색어:</span>
              {popularSearches.map((search) => (
                <Badge
                  key={search}
                  variant="secondary"
                  className="cursor-pointer bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">추천 코스</h2>
          <p className="text-sm text-slate-600">
            {mockCourses.length}개의 코스
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <Card
              key={course.id}
              className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={640}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-blue-600">
                    {course.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="line-clamp-2 text-lg">
                  {course.title}
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor}`} />
                    <AvatarFallback>{course.instructor[0]}</AvatarFallback>
                  </Avatar>
                  <span>{course.instructor}</span>
                </CardDescription>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    ({course.reviewCount.toLocaleString()})
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {course.level}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 pt-0">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">
                    ₩{course.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    ₩{course.originalPrice.toLocaleString()}
                  </span>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  수강신청
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
