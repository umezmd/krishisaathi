"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { evaluateCropSuitability } from "@/lib/suitability";
import { getTranslation } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { CropInfo } from "@/types";

export function CropSuggestionsScreen() {
  const { lang, soilReport, season, setSelectedCrop, setScreen, computeFullPlan } = useApp();

  const rankedCrops = evaluateCropSuitability(soilReport, season);
  const top3 = rankedCrops.slice(0, 3);

  const handleSelectCrop = async (crop: CropInfo) => {
    setSelectedCrop(crop);
    await computeFullPlan(soilReport);
    setScreen("ACTION_PLAN");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("CONTEXT")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("common.back", lang)}</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-agri-green bg-green-50 px-2.5 py-1 rounded-full">
          AI Agronomy Engine
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>{getTranslation("crops.title", lang)}</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {getTranslation("crops.subtitle", lang)} (pH: {soilReport.ph}, EC: {soilReport.ec} dS/m, Season: {season})
        </p>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="space-y-4">
        {top3.map((rec, index) => {
          const isTop = index === 0;
          return (
            <div
              key={rec.crop.id}
              className={`rounded-3xl border-2 p-5 sm:p-6 transition-all shadow-sm ${
                isTop
                  ? "bg-gradient-to-br from-green-50/90 to-emerald-50/50 border-agri-green ring-1 ring-agri-green/30 shadow-soft"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl select-none">{rec.crop.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-agri-green text-white">
                        Rank #{index + 1}
                      </span>
                      {isTop && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Best Match 🌟
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mt-1">
                      {rec.crop.names[lang] || rec.crop.names.en}
                    </h3>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="text-right">
                  <div className="text-2xl font-black text-agri-green-dark">
                    {rec.score}%
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {getTranslation("crops.suitability", lang)}
                  </span>
                </div>
              </div>

              {/* Reasons list */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <div className="text-xs font-bold text-gray-700">
                  {getTranslation("crops.reasons", lang)}
                </div>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {rec.matchReasons.map((reason, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-agri-green flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                {rec.riskWarnings.length > 0 && (
                  <div className="pt-2 text-xs text-amber-800 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      {getTranslation("crops.risks", lang)}
                    </span>
                    <ul className="list-disc pl-4 text-[11px] text-gray-600 space-y-0.5">
                      {rec.riskWarnings.map((warning, wIdx) => (
                        <li key={wIdx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Select Crop CTA */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  NPK Demand: {rec.crop.baseN}-{rec.crop.baseP2O5}-{rec.crop.baseK2O} kg/ha
                </span>
                <button
                  onClick={() => handleSelectCrop(rec.crop)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  <span>Select & Calculate Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
