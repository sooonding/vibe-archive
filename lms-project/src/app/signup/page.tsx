"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSignupMutation } from "@/features/auth/hooks/useSignupMutation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { UserRole } from "@/types/user";
import type { SignupRequest } from "@/features/auth/lib/dto";

const defaultFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  role: "" as "" | typeof UserRole.LEARNER | typeof UserRole.INSTRUCTOR,
  name: "",
  phone: "",
  agreedToTerms: false,
};

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refresh } = useCurrentUser();
  const signupMutation = useSignupMutation();
  const [formState, setFormState] = useState(defaultFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const passwordsMatch = useMemo(
    () =>
      formState.password &&
      formState.confirmPassword &&
      formState.password === formState.confirmPassword,
    [formState.password, formState.confirmPassword]
  );

  const phoneValid = useMemo(() => {
    if (!formState.phone) return false;
    return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(formState.phone);
  }, [formState.phone]);

  const isSubmitDisabled = useMemo(
    () =>
      !formState.email.trim() ||
      !formState.password.trim() ||
      !passwordsMatch ||
      !formState.role ||
      !formState.name.trim() ||
      !phoneValid ||
      !formState.agreedToTerms,
    [
      formState.email,
      formState.password,
      passwordsMatch,
      formState.role,
      formState.name,
      phoneValid,
      formState.agreedToTerms,
    ]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = event.target;
      setFormState((previous) => ({
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleRoleChange = useCallback(
    (role: typeof UserRole.LEARNER | typeof UserRole.INSTRUCTOR) => {
      setFormState((previous) => ({ ...previous, role }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);

      if (formState.password !== formState.confirmPassword) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        return;
      }

      if (!formState.role) {
        setErrorMessage("역할을 선택해주세요.");
        return;
      }

      if (!formState.agreedToTerms) {
        setErrorMessage("약관에 동의해주세요.");
        return;
      }

      const signupRequest: SignupRequest = {
        email: formState.email,
        password: formState.password,
        role: formState.role,
        name: formState.name,
        phone: formState.phone,
        agreedToTerms: true,
      };

      try {
        const result = await signupMutation.mutateAsync(signupRequest);

        const supabase = getSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (signInError) {
          setErrorMessage("로그인에 실패했습니다. 다시 시도해주세요.");
          return;
        }

        await refresh();

        const redirectPath =
          result.user.role === UserRole.LEARNER
            ? "/courses"
            : "/instructor/dashboard";

        router.replace(redirectPath);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("회원가입 처리 중 문제가 발생했습니다.");
        }
      }
    },
    [
      formState.email,
      formState.password,
      formState.confirmPassword,
      formState.role,
      formState.name,
      formState.phone,
      formState.agreedToTerms,
      signupMutation,
      refresh,
      router,
    ]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          역할을 선택하고 프로필을 입력하여 시작하세요.
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            이메일
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={formState.password}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호 확인
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formState.confirmPassword}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
            {formState.confirmPassword && !passwordsMatch && (
              <span className="text-xs text-rose-500">
                비밀번호가 일치하지 않습니다
              </span>
            )}
            {formState.confirmPassword && passwordsMatch && (
              <span className="text-xs text-emerald-600">
                비밀번호가 일치합니다
              </span>
            )}
          </label>

          <fieldset className="flex flex-col gap-2 text-sm text-slate-700">
            <legend className="mb-1">역할 선택</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.LEARNER}
                  checked={formState.role === UserRole.LEARNER}
                  onChange={() => handleRoleChange(UserRole.LEARNER)}
                  className="h-4 w-4"
                />
                <span>학습자 (Learner)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={UserRole.INSTRUCTOR}
                  checked={formState.role === UserRole.INSTRUCTOR}
                  onChange={() => handleRoleChange(UserRole.INSTRUCTOR)}
                  className="h-4 w-4"
                />
                <span>강사 (Instructor)</span>
              </label>
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            이름
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={formState.name}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            휴대폰번호
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              placeholder="010-1234-5678"
              value={formState.phone}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
            {formState.phone && !phoneValid && (
              <span className="text-xs text-rose-500">
                올바른 휴대폰번호 형식이 아닙니다 (예: 010-1234-5678)
              </span>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formState.agreedToTerms}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <span>이용약관 및 개인정보처리방침에 동의합니다</span>
          </label>

          {errorMessage ? (
            <p className="text-sm text-rose-500">{errorMessage}</p>
          ) : null}

          {isSubmitDisabled && (
            <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
              <p className="mb-1 font-semibold">다음 항목을 확인해주세요:</p>
              <ul className="list-inside list-disc space-y-1">
                {!formState.email.trim() && <li>이메일을 입력하세요</li>}
                {!formState.password.trim() && <li>비밀번호를 입력하세요</li>}
                {formState.password.trim() && !passwordsMatch && (
                  <li>비밀번호가 일치하지 않습니다</li>
                )}
                {!formState.role && <li>역할을 선택하세요</li>}
                {!formState.name.trim() && <li>이름을 입력하세요</li>}
                {!phoneValid && <li>올바른 휴대폰번호를 입력하세요</li>}
                {!formState.agreedToTerms && <li>약관에 동의해주세요</li>}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending || isSubmitDisabled}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {signupMutation.isPending ? "등록 중" : "회원가입"}
          </button>
          <p className="text-xs text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              로그인으로 이동
            </Link>
          </p>
        </form>
        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/signup/640/640"
            alt="회원가입"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
