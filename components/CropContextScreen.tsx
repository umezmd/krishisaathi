"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { CROPS_DATABASE } from "@/data/crops";
import { getTranslation } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Sparkles, Check, Sun, CloudRain, Flame } from "lucide-react";
import { Season } from "@/types";

export function CropContextScreen() {
  const {
    lang,
    landArea,
    setLandArea,
    landUnit,
    setLandUnit,
    season,
    setSeason,
    selectedCrop,
    setSelectedCrop,
    setScreen,
    computeFullPlan,
    soilReport,
  } = useApp();

  const handleGeneratePlan = async () => {
    await computeFullPlan(soilReport);
    setScreen("DASHBOARD");
  };

  const handleSuggestCrops = () => {
    setScreen("CROPS");
  };

  const seasonsList: Array<{ id: Season; labelKey: string; icon: React.ReactNode }> = [
    { id: "Kharif", labelKey: "context.kharif", icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
    { id: "Rabi", labelKey: "context.rabi", icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: "Zaid", labelKey: "context.zaid", icon: <Flame className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("CONFIRM")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("common.back", lang)}</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-agri-green bg-green-50 px-2.5 py-1 rounded-full">
          {getTranslation("common.step", lang)} 2 of 3
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {getTranslation("context.title", lang)}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {getTranslation("context.subtitle", lang)}
        </p>
      </div>

      {/* 1. Land Area with Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {getTranslation("context.landSize", lang)}
        </label>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.5"
              min="0.1"
              max="100"
              value={landArea}
              onChange={(e) => setLandArea(Math.max(0.1, parseFloat(e.target.value) || 1.0))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-agri-green text-xl font-extrabold text-gray-900"
            />
          </div>

          {/* Unit Toggle: Acre vs Hectare */}
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setLandUnit("acre")}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[46px] ${
                landUnit === "acre"
                  ? "bg-agri-green text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {getTranslation("context.acre", lang)}
            </button>
            <button
              type="button"
              onClick={() => setLandUnit("hectare")}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[46px] ${
                landUnit === "hectare"
                  ? "bg-agri-green text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {getTranslation("context.hectare", lang)}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Season Selection (Auto-suggested from current date) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            {getTranslation("context.season", lang)}
          </label>
          <span className="text-[11px] text-agri-green font-semibold bg-green-50 px-2 py-0.5 rounded">
            Auto-suggested
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {seasonsList.map((s) => {
            const isSelected = season === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeason(s.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-h-[58px] ${
                  isSelected
                    ? "border-agri-green bg-green-50 text-agri-green-dark font-bold shadow-sm"
                    : "border-gray-200 bg-gray-50/60 text-gray-700 hover:bg-gray-100 font-medium"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {s.icon}
                  <span className="text-sm">{s.id}</span>
                </div>
                <span className="text-[10px] text-gray-500">{getTranslation(s.labelKey, lang)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Crop Selection Grid & AI Crop Suggestion */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            {getTranslation("context.selectCrop", lang)}
          </label>
          {/* AI Suggest Button */}
          <button
            onClick={handleSuggestCrops}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{getTranslation("context.suggestCrops", lang)}</span>
          </button>
        </div>

        {/* 12 Crops Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CROPS_DATABASE.map((crop) => {
            const isSelected = selectedCrop.id === crop.id;
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  isSelected
                    ? "border-agri-green bg-green-50 shadow-soft ring-1 ring-agri-green"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl select-none">{crop.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`block text-xs font-bold truncate ${isSelected ? "text-agri-green-dark" : "text-gray-900"}`}>
                    {crop.names[lang] || crop.names.en}
                  </span>
                  <span className="block text-[10px] text-gray-500 truncate">
                    NPK {crop.baseN}-{crop.baseP2O5}-{crop.baseK2O}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-agri-green flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big Action Plan CTA Button */}
      <button
        type="button"
        data-testid="generate-plan-btn"
        onClick={handleGeneratePlan}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-lg shadow-elevated transition-transform active:scale-98 min-h-[56px]"
      >
        <span>{getTranslation("context.calculateBtn", lang)}</span>
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
