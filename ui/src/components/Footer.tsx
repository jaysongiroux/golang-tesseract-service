import Link from "next/link";
import { Github, Globe, Shield, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {process.env.NEXT_PUBLIC_PRODUCT_NAME}
            </h3>
            <p className="text-slate-400">
              Turn documents into answers with blazing-fast, AI-powered OCR and
              NLP tools.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#features"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={
                    process.env.NEXT_PUBLIC_SERVICE_BACKEND_URL +
                    "/swagger/index.html"
                  }
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between space-y-4 border-t border-slate-800 pt-8 md:flex-row md:space-y-0">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_PRODUCT_NAME}
            . All rights reserved.
          </p>

          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="API Docs"
            >
              <Globe className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Status Page"
            >
              <Activity className="h-5 w-5" />
            </Link>
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Privacy Policy"
            >
              <Shield className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
