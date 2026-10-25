"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { getTranslation } from "@/lib/i18n";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function SoilDashboardScreen() {
  const { lang, result, setScreen, speakCurrentPlan } = useApp();

  if (!result) return null;

  const { assessment, report, crop } = result;
  const score = assessment.score;

  // Radar chart data: normalize 0 - 100
  const radarData = [
    {
      parameter: "pH",
      score: report.ph >= 6.5 && report.ph <= 7.5 ? 95 : report.ph < 6.0 || report.ph > 8.5 ? 40 : 70,
      fullMark: 100,
    },
    {
      parameter: "EC (Salinity)",
      score: report.ec < 1.0 ? 95 : report.ec <= 2.0 ? 60 : 30,
      fullMark: 100,
    },
    {
      parameter: "Organic Carbon",
      score: report.organicCarbon >= 0.75 ? 95 : report.organicCarbon >= 0.5 ? 70 : 35,
      fullMark: 100,
    },
    {
      parameter: "Nitrogen (N)",
      score: report.nitrogen >= 280 && report.nitrogen <= 560 ? 95 : report.nitrogen < 280 ? 40 : 65,
      fullMark: 100,
    },
    {
      parameter: "Phosphorus (P)",
      score: report.phosphorus >= 10 && report.phosphorus <= 25 ? 95 : report.phosphorus < 10 ? 35 : 55,
      fullMark: 100,
    },
    {
      parameter: "Potassium (K)",
      score: report.potassium >= 108 && report.potassium <= 280 ? 95 : report.potassium < 108 ? 40 : 65,
      fullMark: 100,
    },
  ];

  // Helper for emoji per parameter
  const getParamEmoji = (param: string) => {
    switch (param) {
      case "ph":
        return "⚖️";
      case "ec":
        return "🧂";
      case "organicCarbon":
        return "🍂";
      case "nitrogen":
        return "🌿";
      case "phosphorus":
        return "🪨";
      case "potassium":
        return "🥔";
      case "zinc":
        return "🛡️";
      case "sulphur":
        return "🟡";
      default:
        return "🧪";
    }
  };

  const getStatusBadge = (status: "danger" | "warning" | "success" | "neutral") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {getTranslation("dashboard.status.ideal", lang)}
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Watch
          </span>
        );
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Action Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {getTranslation("confirm.notTested", lang)}
          </span>
        );
    }
  };

  const ringColor = score >= 75 ? "#2E7D32" : score >= 50 ? "#F9A825" : "#D32F2F";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("CONTEXT")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("common.back", lang)}</span>
        </button>

        {/* Tab Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen("ACTION_PLAN")}
            className="text-xs font-bold text-agri-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-all"
          >
            {getTranslation("nav.plan", lang)} →
          </button>
        </div>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {getTranslation("dashboard.title", lang)}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {report.fieldName} • {crop.names[lang] || crop.names.en} ({result.landArea}{" "}
          {result.landUnit})
        </p>
      </div>

      {/* Hero Soil Health Score Card & Radar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft">
        {/* Left: Score Gauge */}
        <div className="md:col-span-5 flex flex-col items-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#EAE6DF"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={ringColor}
                strokeWidth="10"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-gray-900">{score}</span>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                / 100
              </span>
            </div>
          </div>

          <h3 className="font-extrabold text-lg text-gray-900 mt-1">
            {getTranslation("dashboard.scoreLabel", lang)}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">{assessment.summary}</p>
        </div>

        {/* Right: Radar Chart */}
        <div className="md:col-span-7 h-56 sm:h-64 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider self-start px-2 mb-1">
            {getTranslation("dashboard.radarTitle", lang)}
          </span>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#E0DCD3" />
              <PolarAngleAxis dataKey="parameter" tick={{ fill: "#6D4C41", fontSize: 11, fontWeight: "bold" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#ccc" />
              <Radar
                name="Soil Profile"
                dataKey="score"
                stroke="#2E7D32"
                fill="#2E7D32"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nutrient Traffic Light Cards Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          {getTranslation("dashboard.parametersTitle", lang)}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {assessment.parameters.map((p) => {
            const emoji = getParamEmoji(p.param as string);
            return (
              <div
                key={p.param}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-soft transition-all space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{emoji}</span>
                    <span className="font-bold text-sm text-gray-900">{p.name}</span>
                  </div>
                  {/* Card Audio Button */}
                  <button
                    onClick={() =>
                      speakCurrentPlan(
                        `${p.name}. Value is ${p.value ?? "not tested"} ${p.unit}. Status is ${p.rating}. ${p.meaning}`
                      )
                    }
                    className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-agri-green transition-colors"
                    title="Read this nutrient aloud"
                    aria-label={`Listen to ${p.name}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-gray-900">
                      {p.value !== null && p.value !== undefined ? p.value : "—"}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{p.unit}</span>
                  </div>
                  {getStatusBadge(p.status)}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[36px]">
                  {p.meaning}
                </p>

                <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Benchmark:</span>
                  <span className="font-semibold text-gray-600">{p.benchmark}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button to Step-by-Step Action Plan */}
      <div className="pt-2">
        <button
          type="button"
          data-testid="goto-action-plan"
          onClick={() => setScreen("ACTION_PLAN")}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-lg shadow-elevated transition-transform active:scale-98 min-h-[56px]"
        >
          <span>{getTranslation("plan.title", lang)}</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
