"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/i18n";
import { CheckCircle2, ArrowRight, Sprout } from "lucide-react";

export function LanguageSelectScreen() {
  const { lang, setLang, setScreen } = useApp();

  const handleSelectLanguage = (code: typeof lang) => {
    setLang(code);
  };

  const handleContinue = () => {
    setScreen("HOME");
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-xl mx-auto px-4 py-8">
      {/* App Branding Splash */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-agri-green text-white shadow-elevated mb-4">
          <Sprout className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-agri-green-dark tracking-tight">
          {getTranslation("appName", lang)}
        </h1>
        <p className="text-base text-soil font-semibold mt-1">
          {getTranslation("tagline", lang)}
        </p>
        <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
          {getTranslation("subtitle", lang)}
        </p>
      </div>

      {/* Language Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {getTranslation("languageSelect.title", lang)}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {getTranslation("languageSelect.subtitle", lang)}
        </p>
      </div>

      {/* Large Language Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
        {SUPPORTED_LANGUAGES.map((l) => {
          const isSelected = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => handleSelectLanguage(l.code)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all min-h-[90px] text-center active:scale-95 ${
                isSelected
                  ? "border-agri-green bg-green-50/80 shadow-soft ring-2 ring-agri-green/30"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 shadow-sm"
              }`}
              aria-label={`Select ${l.name} (${l.nativeName})`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-agri-green">
                  <CheckCircle2 className="w-5 h-5 fill-agri-green text-white" />
                </div>
              )}
              <span className="text-2xl font-bold text-gray-900 leading-tight">
                {l.nativeName}
              </span>
              <span className="text-xs font-medium text-gray-500 mt-1">{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* Big Continue Button */}
      <button
        onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-agri-green hover:bg-agri-green-dark text-white font-bold text-lg shadow-elevated transition-transform active:scale-98 min-h-[56px]"
      >
        <span>{getTranslation("languageSelect.continue", lang)}</span>
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
}
