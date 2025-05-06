"use client";

import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff } from "lucide-react";
import { calculatePasswordStrength } from "@/utils/zodSchema";

type PasswordInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  error: string | null;
  name: string;
  label?: string;
  isConfirmPassword?: boolean;
};

const PasswordInput = ({
  value,
  onChange,
  disabled,
  error,
  name = "password",
  label = "Password",
  isConfirmPassword = false,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(value);
  }, [value]);

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Very Weak";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Medium";
    if (passwordStrength === 3) return "Strong";
    return "Very Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500";
    if (passwordStrength === 1) return "bg-orange-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    if (passwordStrength === 3) return "bg-green-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className={`border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 pr-10 ${
            error ? "border-red-500" : ""
          }`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : (
        value &&
        !isConfirmPassword && (
          <>
            <div className="mt-2 flex w-full gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i < passwordStrength
                      ? getPasswordStrengthColor()
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <p
              className={`mt-1 text-xs ${
                passwordStrength < 2
                  ? "text-red-400"
                  : passwordStrength < 4
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {getPasswordStrengthText()}
            </p>
          </>
        )
      )}
    </div>
  );
};

export default PasswordInput;
