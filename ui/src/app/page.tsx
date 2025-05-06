"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/code-block";
import { GlowingButton } from "@/components/GlowingButton";
import {
  Scan,
  Braces,
  MessageSquareText,
  Zap,
  Filter,
  EyeOff,
  Globe,
} from "lucide-react";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AnimatedFeatureCard } from "@/components/AnimatedFeatureCard";
import { AnimatedProductCard } from "@/components/AnimatedProductCard";
import { FloatingAnimation } from "@/components/FloatingAnimation";
import { Particles } from "@/components/Particles";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50 scroll-smooth">
      <section className="relative overflow-hidden py-20 md:py-32">
        <AnimatedBackground />
        <Particles />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <AnimatedText delay={0.1}>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              See Data{" "}
              <motion.span
                className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                Clearly.
              </motion.span>
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
              Turn documents into answers with blazing-fast, AI-powered OCR and
              NLP tools.
            </p>
          </AnimatedText>
          <AnimatedContainer delay={0.3}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row ">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlowingButton asChild>
                  <Link className="text-slate-50" href="/auth/signup">
                    Start Free
                  </Link>
                </GlowingButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#docs">
                  <Button
                    variant="outline"
                    className="border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    View Docs
                  </Button>
                </Link>
              </motion.div>
            </div>
          </AnimatedContainer>

          <FloatingAnimation delay={0.5} className="mt-16">
            <motion.div
              className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/50 p-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-lg bg-slate-950 p-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-xs text-slate-400">Terminal</div>
                </div>
                <motion.div
                  className="pt-2 font-mono text-sm text-slate-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                  >
                    {/* POST request with cache_policy=cache_first */}$ curl
                    https://api.{process.env.NEXT_PUBLIC_DOMAIN_NAME}
                    /services/ocr -X POSt -F file=@invoice.pdf -H
                    &apos;Content-Type: multipart/form-data&apos; -H
                    &apos;Authorization: Bearer YOUR_KEY&apos;
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.3 }}
                    className="text-green-400"
                  >
                    ✓ Document processed in 287ms
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </FloatingAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              Key Features
            </h2>
          </AnimatedText>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <AnimatedFeatureCard
              title="Intelligent OCR"
              description="Extract text with surgical precision using state-of-the-art AI models."
              icon={<Scan className="h-6 w-6 text-white" />}
              index={0}
            />
            <AnimatedFeatureCard
              title="JSON-Ready Output"
              description="Go beyond text — instantly convert documents into structured JSON."
              icon={<Braces className="h-6 w-6 text-white" />}
              index={1}
            />
            <AnimatedFeatureCard
              title="Ask Your Docs"
              description="Transform scanned pages into API-accessible answers using LLMs."
              icon={<MessageSquareText className="h-6 w-6 text-white" />}
              index={2}
            />
            <AnimatedFeatureCard
              title="Blazing Fast"
              description="Process a single-page PDF in under 300ms with automatic caching."
              icon={<Zap className="h-6 w-6 text-white" />}
              index={3}
            />
          </div>
        </div>
      </section>

      {/* Product Ideas Section */}
      <section className="py-20 bg-slate-900/50" id="products">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              Additional Products
            </h2>
          </AnimatedText>
          <div className="grid gap-8 md:grid-cols-3">
            <AnimatedProductCard
              title="Auto-Classifier"
              description="Automatically detect document types (invoices, contracts, IDs) to route or process them accordingly."
              icon={<Filter className="h-6 w-6 text-white" />}
              index={0}
            />
            <AnimatedProductCard
              title="Redact & Replace"
              description="Use AI to automatically redact sensitive information or replace it with pseudonyms."
              icon={<EyeOff className="h-6 w-6 text-white" />}
              index={1}
            />
            <AnimatedProductCard
              title="Multi-Language OCR & Translation"
              description="Extract and translate documents in over 50 languages with one call."
              icon={<Globe className="h-6 w-6 text-white" />}
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" id="pricing">
        <div className="container mx-auto px-4 text-center">
          <AnimatedText>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Pay As You Grow
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-300">
              Transparent usage-based pricing. Only pay for what you scan.
            </p>
          </AnimatedText>
          <AnimatedContainer delay={0.2}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/pricing">
                <Button className="text-slate-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  See Pricing
                </Button>
              </Link>
            </motion.div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className="py-20 bg-slate-900/50" id="docs">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              Simple Integration
            </h2>
          </AnimatedText>
          <AnimatedContainer className="mx-auto max-w-3xl">
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="curl" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CodeBlock
                    language="bash"
                    code={`curl https://api.${process.env.NEXT_PUBLIC_DOMAIN_NAME}/services/ocr \\
  -F file=@contract.pdf \\
  -H "Authorization: Bearer YOUR_KEY"`}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="javascript" className="mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CodeBlock
                    language="javascript"
                    code={`const response = await fetch('https://api.${process.env.NEXT_PUBLIC_DOMAIN_NAME}/services/ocr', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_KEY'
  },
  body: formData
});

const data = await response.json();
console.log(data);`}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </AnimatedContainer>
        </div>
      </section>
    </div>
  );
}
