"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/state";
import { getTranslation, formatRupees } from "@/lib/i18n";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CloudRain,
  Sun,
  AlertTriangle,
  Ban,
  Package,
  Clock,
  Volume2,
  Calendar,
  Layers,
} from "lucide-react";

export function ActionPlanScreen() {
  const { lang, result, setScreen, speakCurrentPlan } = useApp();
  const [aiSteps, setAiSteps] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti on mounting action plan
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#2E7D32", "#F9A825", "#4CAF50"],
      });
    } catch {}

    // Fetch AI / Template plain-language explanation
    if (result) {
      setLoadingAi(true);
      fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: result.fertilizerPlan,
          assessment: result.assessment,
          lang,
          cropName: result.crop.names[lang] || result.crop.names.en,
          weather: result.weather,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.steps && data.steps.length > 0) {
            setAiSteps(data.steps);
          }
        })
        .catch((e) => console.warn("Explain API fallback:", e))
        .finally(() => setLoadingAi(false));
    }
  }, [result, lang]);

  if (!result) return null;

  const { fertilizerPlan, costComparison, weather, crop } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("DASHBOARD")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("nav.dashboard", lang)}</span>
        </button>

        <button
          onClick={() => setScreen("SAVINGS")}
          className="text-xs font-bold text-agri-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-all"
        >
          {getTranslation("nav.savings", lang)} →
        </button>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          {getTranslation("plan.title", lang)}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {crop.names[lang] || crop.names.en} • {result.landArea} {result.landUnit} (
          {result.fertilizerPlan.areaInAcres} Acres) • {result.season}
        </p>
      </div>

      {/* Hero Savings Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-5 sm:p-6 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-100 bg-white/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {getTranslation("savings.heroSaved", lang)}
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {formatRupees(costComparison.totalSavings)}
          </div>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            {costComparison.savingsPerAcre > 0 && (
              <span>
                {formatRupees(costComparison.savingsPerAcre)} {getTranslation("savings.perAcre", lang)}
              </span>
            )}
            {" • "}
            <span>Scientific soil-test based fertilizer reduction</span>
          </p>
        </div>

        <button
          onClick={() => setScreen("SAVINGS")}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-amber-800 hover:bg-amber-50 font-bold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          {getTranslation("nav.savings", lang)} Breakdown →
        </button>
      </div>

      {/* Weather Aware Advisory Widget */}
      {weather && (
        <div
          className={`rounded-2xl p-4 sm:p-5 border-2 shadow-sm flex items-start gap-3.5 ${
            weather.hasHeavyRainWarning
              ? "bg-blue-50 border-blue-400 text-blue-900"
              : weather.hasHeatWarning
              ? "bg-amber-50 border-amber-400 text-amber-900"
              : "bg-emerald-50 border-emerald-300 text-emerald-950"
          }`}
        >
          <div className="p-2.5 rounded-xl bg-white shadow-sm flex-shrink-0">
            {weather.hasHeavyRainWarning ? (
              <CloudRain className="w-6 h-6 text-blue-600" />
            ) : (
              <Sun className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {getTranslation("plan.weatherAlertTitle", lang)}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80">
                {weather.temp}°C • {weather.condition}
              </span>
            </div>
            <p className="font-bold text-sm sm:text-base mt-1 leading-snug">
              {weather.advisoryText}
            </p>
          </div>
        </div>
      )}

      {/* Plain Language Action Steps (AI / Rules Speech Ready) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🗣️</span>
            <span>Farmer Action Summary</span>
          </h2>
          <button
            onClick={() => speakCurrentPlan(aiSteps.join(" "))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 hover:bg-green-100 text-agri-green text-xs font-bold transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{getTranslation("voice.listenPlan", lang)}</span>
          </button>
        </div>

        {loadingAi ? (
          <div className="py-4 space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {aiSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-agri-bg/60 border border-gray-100 text-sm font-semibold text-gray-800 leading-relaxed"
              >
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "DO NOT ADD" Red Cards (Hero Safety Feature) */}
      {fertilizerPlan.doNotAddList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <Ban className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
              {getTranslation("plan.doNotAddTitle", lang)}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fertilizerPlan.doNotAddList.map((item, idx) => (
              <div
                key={idx}
                className="bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-red-900 text-base">
                    ❌ {item.product}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                    STOP
                  </span>
                </div>
                <p className="text-xs text-red-950 font-medium leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commercial Fertilizer Bags Summary */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-agri-green" />
          <h2 className="text-lg font-bold text-gray-900">
            Fertilizer Bag Requirements ({fertilizerPlan.areaInAcres} Acres)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Urea Card */}
          <div className="bg-stone-50 rounded-2xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-800">Urea (46% N)</span>
              <span className="text-xl">⚪</span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {fertilizerPlan.ureaBags}{" "}
              <span className="text-xs font-bold text-gray-500">
                {getTranslation("plan.bags", lang)}
              </span>
            </div>
            <p className="text-xs text-gray-500">Total: {fertilizerPlan.ureaKg} kg</p>
          </div>

          {/* DAP Card */}
          <div
            className={`rounded-2xl border p-4 space-y-2 ${
              fertilizerPlan.skipDap
                ? "bg-red-50/60 border-red-200"
                : "bg-stone-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-800">DAP (18-46-0)</span>
              <span className="text-xl">🟤</span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {fertilizerPlan.skipDap ? "0" : fertilizerPlan.dapBags}{" "}
              <span className="text-xs font-bold text-gray-500">
                {getTranslation("plan.bags", lang)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {fertilizerPlan.skipDap ? "Skipped (Saves ₹2,700!)" : `Total: ${fertilizerPlan.dapKg} kg`}
            </p>
          </div>

          {/* MOP Potash Card */}
          <div
            className={`rounded-2xl border p-4 space-y-2 ${
              fertilizerPlan.skipMop
                ? "bg-red-50/60 border-red-200"
                : "bg-stone-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-gray-800">MOP (Potash 60%)</span>
              <span className="text-xl">🔴</span>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {fertilizerPlan.skipMop ? "0" : fertilizerPlan.mopBags}{" "}
              <span className="text-xs font-bold text-gray-500">
                {getTranslation("plan.bags", lang)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {fertilizerPlan.skipMop ? "Skipped (Rich soil K)" : `Total: ${fertilizerPlan.mopKg} kg`}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Application Timeline */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <Clock className="w-5 h-5 text-soil" />
          <h2 className="text-lg font-bold text-gray-900">
            {getTranslation("plan.timelineTitle", lang)}
          </h2>
        </div>

        <div className="space-y-4">
          {fertilizerPlan.schedule.map((sch, idx) => (
            <div
              key={sch.stage}
              className="relative pl-6 pb-2 border-l-2 border-agri-green/30 last:border-l-0"
            >
              {/* Timeline marker node */}
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-agri-green border-2 border-white shadow-sm" />

              <div className="bg-stone-50/80 rounded-2xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">
                    {sch.stageName}
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-agri-green/10 text-agri-green">
                    {sch.daysAfterSowing}
                  </span>
                </div>

                {sch.fertilizers.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {sch.fertilizers.map((fert, fIdx) => (
                      <div
                        key={fIdx}
                        className="bg-white p-3 rounded-xl border border-gray-100 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-sm text-gray-900 block">
                            {fert.product}
                          </span>
                          <span className="text-gray-500 mt-0.5 block">{fert.notes}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-extrabold text-sm text-agri-green block">
                            {fert.bags} bags
                          </span>
                          <span className="text-gray-400 font-medium">({fert.amountKg} kg)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No chemical fertilizers needed at this stage. Keep field weed-free.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Soil Amendments (Lime, Gypsum, Zinc, FYM) */}
      {fertilizerPlan.amendments.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Layers className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {getTranslation("plan.amendmentsTitle", lang)}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fertilizerPlan.amendments.map((a, idx) => (
              <div
                key={idx}
                className="bg-amber-50/50 rounded-2xl border border-amber-200 p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-950">{a.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {a.amountUnit}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-800">{a.product}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{a.reason}</p>
                <p className="text-[11px] font-bold text-amber-800 pt-1 border-t border-amber-100">
                  ⏰ Timing: {a.timing}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA to Savings */}
      <div className="pt-2">
        <button
          type="button"
          data-testid="goto-savings"
          onClick={() => setScreen("SAVINGS")}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-lg shadow-elevated transition-transform active:scale-98 min-h-[56px]"
        >
          <span>{getTranslation("savings.title", lang)} & Charts</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
