"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/validation/phone";
import { useCallback, useEffect, useState } from "react";

type ProfileFormProps = {
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  nameError?: string;
  phoneError?: string;
};

export const ProfileForm = ({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  nameError,
  phoneError,
}: ProfileFormProps) => {
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);

  const handlePhoneChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const normalized = normalizePhoneNumber(value);
      onPhoneChange(normalized);
    },
    [onPhoneChange]
  );

  useEffect(() => {
    if (phone.length > 0 && !isValidPhoneNumber(phone)) {
      setPhoneValidationError("10~11자리 숫자를 입력해주세요");
    } else {
      setPhoneValidationError(null);
    }
  }, [phone]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-sm font-medium">
          이름
        </Label>
        <Input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="이름을 입력하세요"
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        {nameError ? <p className="text-sm text-rose-500">{nameError}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          휴대폰번호
        </Label>
        <Input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={handlePhoneChange}
          placeholder="01012345678"
          className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
        {phoneValidationError ? (
          <p className="text-sm text-rose-500">{phoneValidationError}</p>
        ) : null}
        {phoneError ? <p className="text-sm text-rose-500">{phoneError}</p> : null}
      </div>
    </div>
  );
};
