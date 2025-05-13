"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Particles } from "@/components/Particles";
import { Loader2 } from "lucide-react";
import { GlowingButton } from "@/components/GlowingButton";
import { passwordSchema } from "@/utils/zodSchema";
import PasswordInput from "@/components/PasswordInput";

type ValidationErrors = {
  [key: string]: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation errors for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    if (name === "password") {
      // Password strength calculation using zod validation rules
      const { error } = passwordSchema.safeParse(value);
      if (error) {
        const parsed = error?.formErrors?.formErrors[0];
        setValidationErrors((prev) => ({
          ...prev,
          [name]: parsed,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Call the server action
      const result = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setIsLoading(false);
      if (!result.ok) {
        setError((await result.json()).message);
        return;
      }

      // Sign in with the new credentials
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInResult?.error || !signInResult?.ok) {
        setError(
          "Account created but couldn't sign in automatically. Please try signing in."
        );
        router.push("/auth/login");
        return;
      }

      router.push("/platform");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    if (validationErrors[fieldName] && validationErrors[fieldName].length > 0) {
      return validationErrors[fieldName];
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <section className="relative min-h-screen overflow-hidden py-20 md:py-24">
        <AnimatedBackground />
        <Particles />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-lg">
            <AnimatedText delay={0.1} className="text-center">
              <h1 className="mb-6 text-3xl font-bold md:text-4xl">
                Create Your Account
              </h1>
              <p className="mb-8 text-slate-300">
                Join fellow users and businesses using{" "}
                {process.env.NEXT_PUBLIC_PRODUCT_NAME}
              </p>
            </AnimatedText>

            <AnimatedContainer delay={0.2}>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-lg p-8">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 ${
                          getFieldError("name") ? "border-red-500" : ""
                        }`}
                        disabled={isLoading}
                      />
                      {getFieldError("name") && (
                        <p className="mt-1 text-xs text-red-500">
                          {getFieldError("name")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 ${
                        getFieldError("email") ? "border-red-500" : ""
                      }`}
                      disabled={isLoading}
                    />
                    {getFieldError("email") && (
                      <p className="mt-1 text-xs text-red-500">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>

                  <PasswordInput
                    disabled={isLoading}
                    onChange={handleChange}
                    value={formData.password}
                    error={getFieldError("password")}
                    name="password"
                  />

                  <PasswordInput
                    name="confirmPassword"
                    disabled={isLoading}
                    onChange={handleChange}
                    value={formData.confirmPassword}
                    error={getFieldError("confirmPassword")}
                    isConfirmPassword={true}
                    label="Confirm Password"
                  />

                  <GlowingButton
                    type="submit"
                    className="w-full text-slate-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </GlowingButton>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-slate-400">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer
              delay={0.3}
              className="mt-8 text-center text-sm text-slate-500"
            >
              <p>
                By creating an account, you agree to our{" "}
                <Link
                  href="#"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </AnimatedContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
