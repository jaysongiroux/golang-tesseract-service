"use client";

import { useState } from "react";
import { AnimatedContainer } from "./AnimatedContainer";
import { Slider } from "./ui/slider";
import { FREE_PAGES, PRICE_PER_PAGE } from "@/lib/constants";

const min = 0;
const max = 1_000;
const step = 10;

const CalculateCostCard = () => {
  const [pageCount, setPageCount] = useState(FREE_PAGES);

  const calculateCost = (pages: number): number => {
    const paidPages = Math.max(0, pages - FREE_PAGES);
    return parseFloat((paidPages * PRICE_PER_PAGE).toFixed(2));
  };

  const totalCost = calculateCost(pageCount);

  return (
    <AnimatedContainer delay={0.2} className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-lg p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <label className="text-lg font-medium">Monthly Page Volume</label>
            <div className="text-2xl font-bold">
              {pageCount.toLocaleString()}
            </div>
          </div>
          <Slider
            className="mt-6"
            defaultValue={[FREE_PAGES]}
            min={min}
            max={max}
            step={step}
            onValueChange={(value) => setPageCount(value[0])}
          />
          <div className="mt-2 flex justify-between text-sm text-slate-400">
            <span>{min}</span>
            <span>{max}</span>
            <span>{max}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
            <h3 className="text-lg font-medium text-slate-300">Monthly Cost</h3>
            <div className="mt-2 text-3xl font-bold">
              ${totalCost}
              <span className="ml-1 text-sm text-slate-400">USD</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {FREE_PAGES} free pages included
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-slate-300">
                Effective Rate
              </h3>
            </div>
            <div className="mt-2 text-3xl font-bold">
              ${pageCount > FREE_PAGES ? PRICE_PER_PAGE : 0}
              <span className="ml-1 text-sm text-slate-400">/page</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default CalculateCostCard;
