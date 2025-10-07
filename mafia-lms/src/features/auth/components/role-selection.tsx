"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RoleSelectionProps = {
  value: "learner" | "instructor" | "";
  onChange: (value: "learner" | "instructor") => void;
  error?: string;
};

export const RoleSelection = ({ value, onChange, error }: RoleSelectionProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Label className="text-sm font-medium">역할 선택</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as "learner" | "instructor")}
      >
        <div className="flex items-center space-x-2 rounded-md border border-slate-200 p-3 transition hover:border-slate-400">
          <RadioGroupItem value="learner" id="learner" />
          <Label htmlFor="learner" className="flex-1 cursor-pointer">
            <div className="font-medium">학습자 (Learner)</div>
            <div className="text-xs text-slate-500">
              코스를 수강하고 과제를 제출합니다
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-md border border-slate-200 p-3 transition hover:border-slate-400">
          <RadioGroupItem value="instructor" id="instructor" />
          <Label htmlFor="instructor" className="flex-1 cursor-pointer">
            <div className="font-medium">강사 (Instructor)</div>
            <div className="text-xs text-slate-500">
              코스를 개설하고 과제를 관리합니다
            </div>
          </Label>
        </div>
      </RadioGroup>
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
};
