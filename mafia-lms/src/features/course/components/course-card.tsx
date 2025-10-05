"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PublicCourse } from "../lib/dto";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type CourseCardProps = {
  course: PublicCourse;
};

export const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirectedFrom=/courses/${course.id}`);
      return;
    }
    router.push(`/courses/${course.id}`);
  }, [isAuthenticated, router, course.id]);

  return (
    <Card
      className="group cursor-pointer border-border transition-all duration-200 hover:shadow-lg"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-slate-100 to-slate-200">
          <Image
            src={`https://picsum.photos/seed/${course.id}/640/360`}
            alt={course.title}
            width={640}
            height={360}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <Badge className="absolute left-2 top-2 bg-purple-600 text-white">
            {course.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <CardTitle className="mb-1 line-clamp-2 text-base font-bold">
          {course.title}
        </CardTitle>
        <CardDescription className="mb-2 text-xs text-muted-foreground">
          {course.instructorName}
        </CardDescription>
        {course.description ? (
          <p className="mb-2 line-clamp-2 text-xs text-slate-600">
            {course.description}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {course.difficulty}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <p className="text-xs text-slate-500">자세히 보기 →</p>
      </CardFooter>
    </Card>
  );
};
