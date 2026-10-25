"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/state";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/i18n";
import { Sparkles, Globe, WifiOff, Sprout } from "lucide-react";

export function Navbar() {
  const { lang, setLang, screen, setScreen, isDemoMode, setDemoMode, loadSample, isOffline } =
    useApp();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const startDemo = () => {
    setDemoMode(true);
    loadSample("punjab-wheat");
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-agri-border px-4 py-3 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setScreen("HOME")}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-agri-green flex items-center justify-center text-white shadow-soft group-hover:bg-agri-green-dark transition-colors">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-agri-green-dark">
                {getTranslation("appName", lang)}
              </span>
              {isOffline && (
                <span className="inline-flex items-center gap-0.5 text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>
            <p className="text-[11px] text-soil font-medium hidden sm:block">
              {getTranslation("tagline", lang)}
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 60s Demo Mode Button */}
          <button
            onClick={startDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm ${
              isDemoMode
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
            }`}
            title="Auto-load realistic Punjab sample for instant 60s judge walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 fill-amber-500" />
            <span>⚡ 60s Demo</span>
          </button>

          {/* Language Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-agri-green bg-gray-50 text-xs sm:text-sm font-medium text-gray-800 transition-colors"
              aria-label="Change Language"
            >
              <Globe className="w-4 h-4 text-agri-green" />
              <span className="font-semibold">{currentLangInfo.nativeName}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Select Language / भाषा
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-green-50 transition-colors ${
                      lang === l.code ? "font-bold text-agri-green bg-green-50/70" : "text-gray-700"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-xs text-gray-400">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
