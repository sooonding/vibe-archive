"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { RoleSelection } from "@/features/auth/components/role-selection";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { TermsAgreement } from "@/features/auth/components/terms-agreement";
import { extractApiErrorMessage } from "@/lib/remote/api-client";
import type { SignupRequest } from "@/features/auth/lib/dto";

const defaultFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  role: "" as "" | "learner" | "instructor",
  name: "",
  phone: "",
  termsAccepted: false,
};

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refresh } = useCurrentUser();
  const [formState, setFormState] = useState(defaultFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const signupMutation = useSignup();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const isSubmitDisabled = useMemo(
    () =>
      !formState.email.trim() ||
      !formState.password.trim() ||
      formState.password !== formState.confirmPassword ||
      !formState.role ||
      !formState.name.trim() ||
      !formState.phone.trim() ||
      !formState.termsAccepted,
    [
      formState.confirmPassword,
      formState.email,
      formState.password,
      formState.role,
      formState.name,
      formState.phone,
      formState.termsAccepted,
    ]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((previous) => ({ ...previous, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);
      setInfoMessage(null);

      if (formState.password !== formState.confirmPassword) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        return;
      }

      if (!formState.role) {
        setErrorMessage("역할을 선택해주세요.");
        return;
      }

      const signupRequest: SignupRequest = {
        email: formState.email,
        password: formState.password,
        role: formState.role,
        name: formState.name,
        phone: formState.phone,
        termsAccepted: formState.termsAccepted,
      };

      try {
        await signupMutation.mutateAsync(signupRequest);

        const supabase = getSupabaseBrowserClient();
        const result = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (result.error) {
          setInfoMessage(
            "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다."
          );
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }

        await refresh();

        const redirectPath =
          formState.role === "learner" ? "/courses" : "/dashboard";
        router.replace(redirectPath);
      } catch (error) {
        const message = extractApiErrorMessage(
          error,
          "회원가입 처리 중 문제가 발생했습니다."
        );
        setErrorMessage(message);
      }
    },
    [formState, signupMutation, refresh, router]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          Mafia LMS에 가입하고 학습을 시작하세요
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4">
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
            </label>
          </div>

          <RoleSelection
            value={formState.role}
            onChange={(role) =>
              setFormState((prev) => ({ ...prev, role }))
            }
          />

          <ProfileForm
            name={formState.name}
            phone={formState.phone}
            onNameChange={(name) =>
              setFormState((prev) => ({ ...prev, name }))
            }
            onPhoneChange={(phone) =>
              setFormState((prev) => ({ ...prev, phone }))
            }
          />

          <TermsAgreement
            checked={formState.termsAccepted}
            onChange={(termsAccepted) =>
              setFormState((prev) => ({ ...prev, termsAccepted }))
            }
          />

          {errorMessage ? (
            <p className="text-sm text-rose-500">{errorMessage}</p>
          ) : null}
          {infoMessage ? (
            <p className="text-sm text-emerald-600">{infoMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitDisabled || signupMutation.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {signupMutation.isPending ? "등록 중..." : "회원가입"}
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
