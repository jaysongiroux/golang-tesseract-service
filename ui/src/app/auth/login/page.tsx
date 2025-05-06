"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Particles } from "@/components/Particles";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GlowingButton } from "@/components/GlowingButton";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/platform";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      setIsLoading(false);
      if (!res?.error) {
        router.push(callbackUrl);
      } else {
        setError("invalid email or password");
      }
    } catch (error: unknown) {
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <section className="relative min-h-screen overflow-hidden py-20 md:py-32">
        <AnimatedBackground />
        <Particles />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-md">
            <AnimatedText delay={0.1} className="text-center">
              <h1 className="mb-6 text-3xl font-bold md:text-4xl">
                Welcome Back
              </h1>
              <p className="mb-8 text-slate-300">
                Sign in to your account to continue
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

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-slate-800 bg-slate-950/50 text-slate-50 placeholder:text-slate-500 focus:border-blue-500 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <GlowingButton
                    type="submit"
                    className="w-full text-slate-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </GlowingButton>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-slate-400">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer
              delay={0.1}
              className="mt-8 text-center text-sm text-slate-500"
            >
              <p>
                By signing in, you agree to our{" "}
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
