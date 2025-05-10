"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowingButton } from "@/components/GlowingButton";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {process.env.NEXT_PUBLIC_PRODUCT_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-8 md:flex">
          <Link
            href="/#features"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#products"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Products
          </Link>
          <Link
            href="/pricing"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#docs"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Docs
          </Link>
        </nav>

        <div className="hidden space-x-4 md:flex">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <GlowingButton size="sm" className="text-slate-50">
              Start Free
            </GlowingButton>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col space-y-4 px-4 py-6 bg-slate-950 border-b border-slate-800">
            <Link
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#docs"
              className="text-slate-300 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            <div className="flex flex-col space-y-4 pt-4">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="justify-start text-slate-300 hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <GlowingButton>Start Free</GlowingButton>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
