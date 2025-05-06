"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowingButton } from "@/components/GlowingButton";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { AnimatedText } from "@/components/AnimatedText";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Particles } from "@/components/Particles";
import { Check, HelpCircle, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRICE_PER_PAGE } from "@/lib/constants";

export default function PricingPage() {
  const [pageCount, setPageCount] = useState(100_000);
  const freePages = 100;

  const calculateCost = (pages: number): number => {
    const paidPages = Math.max(0, pages - freePages);
    return parseFloat((paidPages * PRICE_PER_PAGE).toFixed(2));
  };

  const totalCost = calculateCost(pageCount);
  const effectiveCost =
    pageCount > 0 ? parseFloat((totalCost / pageCount).toFixed(5)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <AnimatedBackground />
        <Particles />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <AnimatedText delay={0.1}>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              Simple,{" "}
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
                Transparent
              </motion.span>{" "}
              Pricing
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
              Only pay for what you scan. No hidden fees, no complicated tiers.
            </p>
          </AnimatedText>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <AnimatedContainer delay={0.3} className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-lg overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Pay-As-You-Go</h2>
                    <p className="mt-2 text-slate-400">
                      Perfect for businesses of any size
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-4xl font-bold">
                      <span className="text-sm align-top">$</span>
                      {PRICE_PER_PAGE}
                      <span className="text-sm text-slate-400">/page</span>
                    </div>
                    <p className="text-slate-400">after free tier</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                    <h3 className="text-xl font-semibold">Free Tier</h3>
                    <div className="mt-4 text-3xl font-bold">
                      100{" "}
                      <span className="text-sm text-slate-400">
                        pages/month
                      </span>
                    </div>
                    <p className="mt-2 text-slate-400">
                      Perfect for testing or small projects
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-500/20 bg-slate-950/50 p-6 shadow-lg shadow-blue-500/10">
                    <h3 className="text-xl font-semibold">Pay as you go</h3>
                    <p className="mt-2 text-slate-400">
                      Pay as you go for any volume
                    </p>
                    <Link href="/auth/signup">
                      <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>All OCR features included</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>JSON-ready output</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Document Q&A capabilities</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>Multi-language support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>No credit card required to start</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 bg-slate-950/50 p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/auth/signup">
                    <GlowingButton className="w-full" asChild>
                      Start Free Trial
                    </GlowingButton>
                  </Link>
                </motion.div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              Calculate Your Cost
            </h2>
          </AnimatedText>

          <AnimatedContainer delay={0.2} className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-lg p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-medium">
                    Monthly Page Volume
                  </label>
                  <div className="text-2xl font-bold">
                    {pageCount.toLocaleString()}
                  </div>
                </div>
                <Slider
                  className="mt-6"
                  defaultValue={[100]}
                  min={100}
                  max={100000}
                  step={1000}
                  onValueChange={(value) => setPageCount(value[0])}
                />
                <div className="mt-2 flex justify-between text-sm text-slate-400">
                  <span>100</span>
                  <span>5,000</span>
                  <span>10,000</span>
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                  <h3 className="text-lg font-medium text-slate-300">
                    Monthly Cost
                  </h3>
                  <div className="mt-2 text-3xl font-bold">
                    ${totalCost}
                    <span className="ml-1 text-sm text-slate-400">USD</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {freePages} free pages included
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-slate-300">
                      Effective Rate
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="ml-2 h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Your effective rate per page, taking into account
                            the free tier
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="mt-2 text-3xl font-bold">
                    ${effectiveCost}
                    <span className="ml-1 text-sm text-slate-400">/page</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {Math.round((1 - effectiveCost / PRICE_PER_PAGE) * 100)}%
                    savings from free tier
                  </p>
                </div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              How We Compare
            </h2>
          </AnimatedText>

          <AnimatedContainer
            delay={0.2}
            className="mx-auto max-w-4xl overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-4 px-6 text-left">Feature</th>
                  <th className="py-4 px-6 text-center">
                    {/* {process.env.NEXT_PUBLIC_PRODUCT_NAME} */}
                  </th>
                  <th className="py-4 px-6 text-center">Competitors</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Free Tier</td>
                  <td className="py-4 px-6 text-center text-green-500">
                    100 pages/month
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400">
                    0-50 pages/month
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Price Per Page</td>
                  <td className="py-4 px-6 text-center text-green-500">
                    ${PRICE_PER_PAGE}
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400">
                    ${PRICE_PER_PAGE}
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Processing Speed</td>
                  <td className="py-4 px-6 text-center text-green-500">
                    &lt;300ms
                  </td>
                  <td className="py-4 px-6 text-center text-slate-400">
                    1-5 seconds
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">JSON Output</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Raw OCR Output</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Document Q&A</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-4 px-6">Synchronous OCR</td>
                  <td className="py-4 px-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <X className="mx-auto h-5 w-5 text-red-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6">Hidden Fees</td>
                  <td className="py-4 px-6 text-center">
                    <X className="mx-auto h-5 w-5 text-green-500" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Check className="mx-auto h-5 w-5 text-red-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </AnimatedContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <AnimatedText className="text-center">
            <h2 className="mb-12 text-3xl font-bold md:text-4xl">
              Frequently Asked Questions
            </h2>
          </AnimatedText>

          <AnimatedContainer delay={0.2} className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-slate-800">
                <AccordionTrigger className="text-left">
                  What counts as a &quot;page&quot;?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  A &quot;page&quot; is defined as a single page in a document,
                  regardless of content density or file type. For example, a
                  5-page PDF would count as 5 pages. For images, each image file
                  counts as 1 page.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-slate-800">
                <AccordionTrigger className="text-left">
                  Do unused free pages roll over?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  No, the free tier of 100 pages resets at the beginning of each
                  billing cycle and does not roll over.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-slate-800">
                <AccordionTrigger className="text-left">
                  Are there any additional fees?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  No, our pricing is completely transparent. You only pay $
                  {PRICE_PER_PAGE} per page after your free 100 pages. There are
                  no setup fees, maintenance fees, or hidden charges.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-slate-800">
                <AccordionTrigger className="text-left">
                  Do you offer volume discounts?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  No, we do not offer volume discounts. To stay true to our
                  pricing model, we do not offer volume discounts but offer a
                  pay-as-you-go model which very competitive pricing.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-slate-800">
                <AccordionTrigger className="text-left">
                  How am I billed?
                </AccordionTrigger>
                <AccordionContent className="text-slate-300">
                  We bill monthly based on your usage. You&apos;ll only be
                  charged for pages processed beyond your free tier. You can
                  view your current usage and billing information in your
                  dashboard at any time.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AnimatedContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <AnimatedText>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>
          </AnimatedText>
          <AnimatedText delay={0.1}>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-300">
              Try LensAPI.ai today with 100 free pages. No credit card required.
            </p>
          </AnimatedText>
          <AnimatedContainer delay={0.2}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GlowingButton size="lg" asChild>
                <Link href="/auth/signup">Start Free Trial</Link>
              </GlowingButton>
            </motion.div>
          </AnimatedContainer>
        </div>
      </section>
    </div>
  );
}
