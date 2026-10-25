"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/state";
import { getTranslation, formatRupees } from "@/lib/i18n";
import { calculateCostComparison } from "@/lib/cost";
import { DEFAULT_FERTILIZER_PRICES, FertilizerPrices } from "@/data/prices";
import { generatePdfReport } from "@/lib/pdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  Share2,
  Download,
  Settings2,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Ban,
  Package,
} from "lucide-react";

export function SavingsScreen() {
  const { lang, result, setScreen, saveCurrentField } = useApp();
  const [customPrices, setCustomPrices] = useState<FertilizerPrices>(DEFAULT_FERTILIZER_PRICES);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!result) return null;

  // Recalculate cost with custom prices if edited
  const cost = calculateCostComparison(result.fertilizerPlan, customPrices);

  const chartData = [
    {
      name: "Usual Practice",
      cost: cost.typicalCost,
      color: "#8D6E63", // soil brown
      label: "Blanket (2 Urea + 1 DAP / ac)",
    },
    {
      name: "Scientific Plan",
      cost: cost.recommendedCost,
      color: "#2E7D32", // deep green
      label: "Soil Test Recommended",
    },
  ];

  const handleSaveField = () => {
    saveCurrentField();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleWhatsApp = () => {
    const cropName = result.crop.names[lang] || result.crop.names.en;
    let text = `🌾 *KrishiSaathi Savings Report*\n`;
    text += `Field: ${result.report.fieldName} (${result.landArea} ${result.landUnit})\n`;
    text += `Crop: ${cropName}\n`;
    text += `💰 *Total Saved:* ${formatRupees(cost.totalSavings)} (${cost.savingsPercentage}% savings!)\n`;
    text += `Usual Blanket Cost: ${formatRupees(cost.typicalCost)} -> Scientific Plan: ${formatRupees(cost.recommendedCost)}\n`;
    if (result.fertilizerPlan.skipDap) {
      text += `• DAP: 0 bags needed! Saved ${formatRupees(cost.dapSavings)} on unnecessary DAP.\n`;
    }
    text += `Check your soil health card with KrishiSaathi!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("ACTION_PLAN")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("nav.plan", lang)}</span>
        </button>

        <button
          onClick={() => setShowPriceEditor(!showPriceEditor)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Edit Bag Prices</span>
        </button>
      </div>

      {/* Editable Prices Drawer */}
      {showPriceEditor && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-soft space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">
              Customize Subsidized Fertilizer Prices (per 50kg bag)
            </h3>
            <span className="text-xs text-amber-700 font-semibold">Live Recalculation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Urea (50kg)</label>
              <input
                type="number"
                value={customPrices.urea50kg}
                onChange={(e) =>
                  setCustomPrices({ ...customPrices, urea50kg: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">DAP (50kg)</label>
              <input
                type="number"
                value={customPrices.dap50kg}
                onChange={(e) =>
                  setCustomPrices({ ...customPrices, dap50kg: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">SSP (50kg)</label>
              <input
                type="number"
                value={customPrices.ssp50kg}
                onChange={(e) =>
                  setCustomPrices({ ...customPrices, ssp50kg: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">MOP (50kg)</label>
              <input
                type="number"
                value={customPrices.mop50kg}
                onChange={(e) =>
                  setCustomPrices({ ...customPrices, mop50kg: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero "You Save" Counter Card */}
      <div className="bg-gradient-to-br from-agri-green via-agri-green-dark to-[#1B5E20] text-white rounded-3xl p-6 sm:p-8 shadow-elevated text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-green-100 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-agri-yellow" />
          <span>{getTranslation("savings.title", lang)}</span>
        </div>

        <div className="text-4xl sm:text-6xl font-black tracking-tight my-2">
          {formatRupees(cost.totalSavings)}
        </div>

        <p className="text-sm sm:text-base text-green-100 font-medium">
          {getTranslation("savings.perAcre", lang)}:{" "}
          <span className="font-extrabold text-white">{formatRupees(cost.savingsPerAcre)}</span>
          {" • "}
          <span className="font-bold text-agri-yellow">{cost.savingsPercentage}% Cost Reduction</span>
        </p>

        {/* Decorative Rupee Coins */}
        <div className="absolute -bottom-8 -left-8 text-8xl opacity-15 pointer-events-none select-none">
          💰
        </div>
      </div>

      {/* Comparison Chart: Typical vs Recommended */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              Total Expenditure Comparison
            </h3>
            <p className="text-xs text-gray-500">
              Blanket practice ({cost.typicalBags.ureaBags} Urea + {cost.typicalBags.dapBags} DAP) vs Scientific Dose
            </p>
          </div>
          <span className="text-xs font-bold text-agri-green bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Save {cost.savingsPercentage}%
          </span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: "#4E342E", fontSize: 12, fontWeight: "bold" }} />
              <YAxis
                tick={{ fill: "#666", fontSize: 11 }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(value) => [formatRupees(Number(value)), "Cost"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #ccc" }}
              />
              <Bar dataKey="cost" radius={[8, 8, 0, 0]} barSize={55}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-center">
          <div className="bg-stone-50 p-3 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 block font-medium">Usual Blanket Cost</span>
            <span className="text-lg font-black text-gray-900">{formatRupees(cost.typicalCost)}</span>
          </div>
          <div className="bg-green-50 p-3 rounded-xl border border-green-200">
            <span className="text-xs text-green-800 block font-bold">Scientific Plan Cost</span>
            <span className="text-lg font-black text-agri-green-dark">
              {formatRupees(cost.recommendedCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Bag Savings Breakdown */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-4">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-soil" />
          <span>Detailed Fertilizer Bag Comparison</span>
        </h3>

        <div className="space-y-3 text-sm">
          {/* DAP Comparison */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-gray-200">
            <div>
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <span>DAP (Di-Ammonium Phosphate)</span>
                {result.fertilizerPlan.skipDap && (
                  <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded">
                    SKIPPED
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Usual: {cost.typicalBags.dapBags} bags → Recommended: {cost.recommendedBags.dapBags} bags
              </p>
            </div>
            <div className="text-right">
              <span className="font-black text-agri-green text-sm sm:text-base">
                Save {formatRupees(cost.dapSavings)}
              </span>
            </div>
          </div>

          {/* Urea Comparison */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 border border-gray-200">
            <div>
              <div className="font-bold text-gray-900">Urea (46% N)</div>
              <p className="text-xs text-gray-500">
                Usual: {cost.typicalBags.ureaBags} bags → Recommended: {cost.recommendedBags.ureaBags} bags
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-gray-700 text-sm sm:text-base">
                {cost.recommendedBags.ureaBags} bags optimized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Save to My Fields, WhatsApp, Download PDF */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleSaveField}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white border-2 border-agri-green text-agri-green hover:bg-green-50 font-bold text-base shadow-sm transition-all"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{savedSuccess ? "Saved to My Fields! ✓" : "Save This Report to My Fields"}</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md transition-all active:scale-95 min-h-[52px]"
          >
            <Share2 className="w-5 h-5" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={() => generatePdfReport(result)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-soil hover:bg-soil-dark text-white font-bold text-sm shadow-md transition-all active:scale-95 min-h-[52px]"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
