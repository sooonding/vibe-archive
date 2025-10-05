"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type TermsAgreementProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export const TermsAgreement = ({ checked, onChange, error }: TermsAgreementProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 rounded-md border border-slate-200 p-4">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={(val) => onChange(val === true)}
        />
        <div className="flex-1">
          <Label htmlFor="terms" className="cursor-pointer text-sm">
            <span className="font-medium">서비스 이용약관</span> 및{" "}
            <span className="font-medium">개인정보 처리방침</span>에 동의합니다
          </Label>
          <p className="mt-1 text-xs text-slate-500">
            회원가입을 위해서는 약관 동의가 필요합니다
          </p>
        </div>
      </div>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
};
