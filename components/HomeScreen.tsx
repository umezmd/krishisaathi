"use client";

import React, { useRef, useState } from "react";
import { useApp } from "@/lib/state";
import { getTranslation } from "@/lib/i18n";
import { SampleCardsModal } from "./SampleCardsModal";
import {
  Camera,
  FileSpreadsheet,
  Sparkles,
  History,
  Upload,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export function HomeScreen() {
  const { lang, setScreen, setSoilReport, setReportImage, computeFullPlan, savedFields } = useApp();
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setReportImage(base64);

        // Call /api/extract
        try {
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });

          const data = await res.json();
          if (data?.report) {
            setSoilReport(data.report);
            computeFullPlan(data.report);
          }
        } catch (err) {
          console.warn("OCR API error, falling back to local defaults:", err);
        } finally {
          setIsAnalyzing(false);
          setScreen("CONFIRM");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsAnalyzing(false);
      setScreen("CONFIRM");
    }
  };

  const handleManualEntry = () => {
    setReportImage(null);
    setScreen("CONFIRM");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-agri-green-dark via-agri-green to-[#388E3C] text-white rounded-3xl p-6 shadow-soft relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-agri-yellow" />
            <span>Govt. Soil Health Card Compatible</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {getTranslation("home.welcome", lang)}
          </h1>
          <p className="text-sm sm:text-base text-green-50 mt-2 max-w-sm leading-relaxed">
            {getTranslation("home.helper", lang)}
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-2 right-4 text-7xl opacity-20 select-none pointer-events-none">
          🌾
        </div>
      </div>

      {/* Hidden File Input for Camera / Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Loading Overlay if Image is being analyzed */}
      {isAnalyzing && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500 border-t-transparent animate-spin flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">
              {getTranslation("common.loading", lang)}
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Reading nitrogen, phosphorus, potash, and pH numbers...
            </p>
          </div>
        </div>
      )}

      {/* 3 Main Action Cards */}
      <div className="space-y-3.5">
        {/* Option 1: Scan Soil Health Card */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border-2 border-agri-green/20 hover:border-agri-green shadow-soft hover:shadow-elevated transition-all active:scale-98 min-h-[72px] text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-green-50 text-agri-green flex items-center justify-center p-3 group-hover:bg-agri-green group-hover:text-white transition-colors">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 group-hover:text-agri-green transition-colors">
                  {getTranslation("home.scanCard", lang)}
                </span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Fastest
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTranslation("home.scanDesc", lang)}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-agri-green group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 2: Try A Realistic Sample Card (Demo Hero) */}
        <button
          onClick={() => setShowSampleModal(true)}
          className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 to-yellow-50/50 border-2 border-amber-300 hover:border-amber-400 shadow-soft hover:shadow-elevated transition-all active:scale-98 min-h-[72px] text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center p-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-gray-900 group-hover:text-amber-800 transition-colors">
                  {getTranslation("home.sampleCard", lang)}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                  3 Cards Ready
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {getTranslation("home.sampleDesc", lang)}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 3: Enter Values Manually */}
        <button
          onClick={handleManualEntry}
          className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-soil shadow-sm hover:shadow-soft transition-all active:scale-98 min-h-[72px] text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-stone-100 text-soil flex items-center justify-center p-3 group-hover:bg-soil group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 group-hover:text-soil transition-colors">
                {getTranslation("home.manualCard", lang)}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {getTranslation("home.manualDesc", lang)}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-soil group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Field History Navigation Button */}
      {savedFields.length > 0 && (
        <button
          onClick={() => setScreen("HISTORY")}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-gray-900">
                {getTranslation("home.myFields", lang)} ({savedFields.length})
              </span>
              <p className="text-xs text-gray-500">
                {getTranslation("home.myFieldsDesc", lang)}
              </p>
            </div>
          </div>
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </button>
      )}

      {/* Sample Cards Modal */}
      <SampleCardsModal isOpen={showSampleModal} onClose={() => setShowSampleModal(false)} />
    </div>
  );
}
