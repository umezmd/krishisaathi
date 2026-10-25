"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/state";
import { getTranslation } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Eye, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";

export function ConfirmValuesScreen() {
  const { lang, soilReport, setSoilReport, reportImage, setScreen, computeFullPlan } = useApp();
  const [showPhoto, setShowPhoto] = useState<boolean>(true);
  const [showMicros, setShowMicros] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof soilReport, val: string) => {
    setErrorMsg(null);
    if (field === "fieldName" || field === "date" || field === "id") {
      setSoilReport((prev) => ({ ...prev, [field]: val }));
    } else {
      const num = val === "" ? null : parseFloat(val);
      setSoilReport((prev) => ({ ...prev, [field]: isNaN(num as number) ? null : num }));
    }
  };

  const handleProceed = () => {
    // Validation
    if (!soilReport.ph || soilReport.ph < 3 || soilReport.ph > 11) {
      setErrorMsg("Please enter a valid pH value between 3.0 and 11.0.");
      return;
    }
    if (soilReport.nitrogen === null || soilReport.nitrogen < 10) {
      setErrorMsg("Please enter valid Nitrogen value (minimum 10 kg/ha).");
      return;
    }

    computeFullPlan(soilReport);
    setScreen("CONTEXT");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("HOME")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("common.back", lang)}</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-agri-green bg-green-50 px-2.5 py-1 rounded-full">
          {getTranslation("common.step", lang)} 1 of 3
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {getTranslation("confirm.title", lang)}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {getTranslation("confirm.subtitle", lang)}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex items-center gap-2 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Card Photo on Left, Editable Values on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photo Preview */}
        {reportImage && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Soil Card Preview
              </span>
              <button
                onClick={() => setShowPhoto(!showPhoto)}
                className="text-xs text-agri-green font-semibold lg:hidden"
              >
                {showPhoto ? "Hide Preview" : "Show Preview"}
              </button>
            </div>

            {showPhoto && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-stone-50 max-h-[460px] overflow-y-auto">
                <img
                  src={reportImage}
                  alt="Scanned Soil Health Card"
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Right Column: Editable Parameter Inputs */}
        <div className={`${reportImage ? "lg:col-span-7" : "lg:col-span-12"} space-y-5`}>
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {getTranslation("confirm.fieldName", lang)}
              </label>
              <input
                type="text"
                value={soilReport.fieldName}
                onChange={(e) => handleInputChange("fieldName", e.target.value)}
                placeholder={getTranslation("confirm.fieldNamePlaceholder", lang)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-agri-green focus:border-agri-green text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {getTranslation("confirm.testDate", lang)}
              </label>
              <input
                type="date"
                value={soilReport.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-agri-green focus:border-agri-green text-sm font-medium"
              />
            </div>
          </div>

          {/* Primary Soil Parameters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              {getTranslation("confirm.primaryNutrients", lang)}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* pH */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">pH (Soil Reaction)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="3.0"
                    max="11.0"
                    value={soilReport.ph ?? ""}
                    onChange={(e) => handleInputChange("ph", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Ideal: 6.5 - 7.5</span>
              </div>

              {/* EC */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">EC (dS/m)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10.0"
                    value={soilReport.ec ?? ""}
                    onChange={(e) => handleInputChange("ec", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Safe: &lt; 1.0</span>
              </div>

              {/* Organic Carbon */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">Organic Carbon (%)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5.0"
                    value={soilReport.organicCarbon ?? ""}
                    onChange={(e) => handleInputChange("organicCarbon", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Ideal: &gt; 0.75 %</span>
              </div>

              {/* Nitrogen */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">Available N (kg/ha)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="1000"
                    value={soilReport.nitrogen ?? ""}
                    onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">280 - 560 kg/ha</span>
              </div>

              {/* Phosphorus */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">Available P (kg/ha)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="200"
                    value={soilReport.phosphorus ?? ""}
                    onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">10 - 25 kg/ha</span>
              </div>

              {/* Potassium */}
              <div className="bg-stone-50/70 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700">Available K (kg/ha)</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="number"
                    step="1"
                    min="10"
                    max="900"
                    value={soilReport.potassium ?? ""}
                    onChange={(e) => handleInputChange("potassium", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-900 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">108 - 280 kg/ha</span>
              </div>
            </div>
          </div>

          {/* Optional Micronutrients Collapsible Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <button
              onClick={() => setShowMicros(!showMicros)}
              className="w-full flex items-center justify-between text-left font-bold text-xs uppercase text-gray-700"
            >
              <span>{getTranslation("confirm.micronutrients", lang)}</span>
              {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMicros && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 animate-in fade-in">
                {/* Sulphur */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Sulphur (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilReport.sulphur ?? ""}
                    placeholder="e.g. 12"
                    onChange={(e) => handleInputChange("sulphur", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
                {/* Zinc */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Zinc (ppm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={soilReport.zinc ?? ""}
                    placeholder="e.g. 0.8"
                    onChange={(e) => handleInputChange("zinc", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
                {/* Iron */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Iron (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilReport.iron ?? ""}
                    placeholder="e.g. 5.5"
                    onChange={(e) => handleInputChange("iron", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
                {/* Boron */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Boron (ppm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={soilReport.boron ?? ""}
                    placeholder="e.g. 0.5"
                    onChange={(e) => handleInputChange("boron", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
                {/* Copper */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Copper (ppm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={soilReport.copper ?? ""}
                    placeholder="e.g. 0.3"
                    onChange={(e) => handleInputChange("copper", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
                {/* Manganese */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600">Manganese (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={soilReport.manganese ?? ""}
                    placeholder="e.g. 1.5"
                    onChange={(e) => handleInputChange("manganese", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Big Proceed Button */}
          <button
            type="button"
            data-testid="proceed-to-context"
            onClick={handleProceed}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-lg shadow-elevated transition-transform active:scale-98 min-h-[56px]"
          >
            <span>{getTranslation("confirm.proceed", lang)}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
