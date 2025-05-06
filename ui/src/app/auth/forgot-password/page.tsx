"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Particles } from "@/components/Particles";
import { Loader2, CheckCircle2 } from "lucide-react";
import { GlowingButton } from "@/components/GlowingButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would normally handle the password reset logic
      console.log("Password reset requested for:", email);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      <section className="relative overflow-hidden py-20 md:py-32">
        <AnimatedBackground />
        <Particles />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-md">
            <AnimatedText delay={0.1} className="text-center">
              <h1 className="mb-6 text-3xl font-bold md:text-4xl">
                Reset Your Password
              </h1>
              <p className="mb-8 text-slate-300">
                Enter your email address and we&apos;ll send you a link to reset
                your password
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

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-6"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Check Your Email
                    </h3>
                    <p className="text-center text-slate-400 mb-6">
                      We&apos;ve sent a password reset link to{" "}
                      <span className="text-slate-300">{email}</span>
                    </p>
                    <Link
                      href="/login"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Return to login
                    </Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <GlowingButton
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </GlowingButton>
                  </form>
                )}

                {!success && (
                  <div className="mt-6 text-center text-sm">
                    <p className="text-slate-400">
                      Remember your password?{" "}
                      <Link
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Back to login
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
