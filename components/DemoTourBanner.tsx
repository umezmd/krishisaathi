"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/state";
import { Sparkles, ArrowRight, X, Play, Pause } from "lucide-react";

export function DemoTourBanner() {
  const { isDemoMode, setDemoMode, screen, setScreen, loadSample } = useApp();
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(12);

  const demoStages = [
    { screen: "CONFIRM", title: "1. Verified Soil Card", desc: "Phosphorus is High (36 kg/ha)" },
    { screen: "CONTEXT", title: "2. Crop & Land Area", desc: "Wheat (Rabi), 2.0 Acres" },
    { screen: "DASHBOARD", title: "3. Soil Health Score", desc: "Health Index & Traffic-Light Status" },
    { screen: "ACTION_PLAN", title: "4. Action Plan", desc: "Split-dose schedule & 'Do Not Add' alerts" },
    { screen: "SAVINGS", title: "5. Hero Cost Savings", desc: "Saved ₹2,700 by skipping DAP!" },
  ] as const;

  const currentStageIndex = demoStages.findIndex((s) => s.screen === screen);
  const currentStage = demoStages[currentStageIndex] || demoStages[0];

  useEffect(() => {
    if (!isDemoMode || isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Advance to next screen
          const nextIndex = (currentStageIndex + 1) % demoStages.length;
          setScreen(demoStages[nextIndex].screen);
          return 12;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDemoMode, isPaused, currentStageIndex, demoStages, setScreen]);

  if (!isDemoMode) return null;

  const handleNext = () => {
    const nextIndex = (currentStageIndex + 1) % demoStages.length;
    setScreen(demoStages[nextIndex].screen);
    setSecondsLeft(12);
  };

  return (
    <div className="sticky top-16 z-30 bg-amber-500 text-white shadow-elevated px-4 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black">
            ⚡
          </div>
          <div>
            <div className="font-extrabold flex items-center gap-1.5">
              <span>Judge Demo Tour:</span>
              <span className="underline">{currentStage.title}</span>
              <span className="text-amber-200 text-xs hidden sm:inline">
                ({currentStage.desc})
              </span>
            </div>
            <div className="text-[11px] text-amber-100 flex items-center gap-2">
              <span>Next step in {secondsLeft}s</span>
              <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden inline-block">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${((12 - secondsLeft) / 12) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title={isPaused ? "Resume auto tour" : "Pause auto tour"}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-amber-900 font-bold hover:bg-amber-50 transition-colors shadow-sm"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDemoMode(false)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
