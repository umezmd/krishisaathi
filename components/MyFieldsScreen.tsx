"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { getTranslation, formatRupees } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  History,
  TrendingUp,
  Sprout,
  PlusCircle,
} from "lucide-react";

export function MyFieldsScreen() {
  const { lang, savedFields, loadFieldReport, deleteSavedField, setScreen } = useApp();

  // Create trend line data from saved fields
  const trendData = savedFields.map((f) => ({
    date: f.report.date,
    fieldName: f.report.fieldName,
    score: f.assessment.score,
    ph: f.report.ph,
    oc: Number((f.report.organicCarbon * 100).toFixed(0)), // scaled for visibility
    nitrogen: f.report.nitrogen,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-agri-border">
        <button
          onClick={() => setScreen("HOME")}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{getTranslation("common.back", lang)}</span>
        </button>

        <button
          onClick={() => setScreen("HOME")}
          className="flex items-center gap-1 text-xs font-bold text-agri-green bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add New Card</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-agri-green" />
          <span>{getTranslation("history.title", lang)}</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {getTranslation("history.subtitle", lang)}
        </p>
      </div>

      {/* Multi-date Soil Health Trend Chart (if at least 2 reports exist) */}
      {savedFields.length >= 2 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-agri-green" />
              <span>{getTranslation("history.trendTitle", lang)}</span>
            </h3>
            <span className="text-xs text-gray-400">Scores &amp; Parameters</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Health Score"
                  stroke="#2E7D32"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="nitrogen"
                  name="Nitrogen (kg/ha)"
                  stroke="#F9A825"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* List of Saved Fields */}
      {savedFields.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-2xl">
            🌱
          </div>
          <h3 className="font-bold text-base text-gray-800">
            {getTranslation("history.empty", lang)}
          </h3>
          <button
            onClick={() => setScreen("HOME")}
            className="px-5 py-2.5 rounded-xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-sm shadow-sm transition-all"
          >
            {getTranslation("home.scanCard", lang)}
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {savedFields.map((field) => (
            <div
              key={field.report.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-soft transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-green-50 text-agri-green flex items-center justify-center text-xl flex-shrink-0">
                  {field.crop.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">
                      {field.report.fieldName}
                    </h3>
                    <span className="text-xs font-bold text-agri-green bg-green-50 px-2 py-0.5 rounded-full">
                      Score: {field.assessment.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {field.crop.names[lang] || field.crop.names.en} • {field.landArea}{" "}
                    {field.landUnit} • Tested on {field.report.date}
                  </p>
                  <p className="text-xs font-bold text-amber-700 mt-1">
                    Saved: {formatRupees(field.costComparison.totalSavings)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <button
                  onClick={() => loadFieldReport(field)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-agri-green text-white hover:bg-agri-green-dark text-xs font-bold transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{getTranslation("history.viewReport", lang)}</span>
                </button>
                <button
                  onClick={() => deleteSavedField(field.report.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label={getTranslation("history.delete", lang)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
