"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { Navbar } from "@/components/Navbar";
import { DemoTourBanner } from "@/components/DemoTourBanner";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { LanguageSelectScreen } from "@/components/LanguageSelectScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { ConfirmValuesScreen } from "@/components/ConfirmValuesScreen";
import { CropContextScreen } from "@/components/CropContextScreen";
import { SoilDashboardScreen } from "@/components/SoilDashboardScreen";
import { ActionPlanScreen } from "@/components/ActionPlanScreen";
import { SavingsScreen } from "@/components/SavingsScreen";
import { CropSuggestionsScreen } from "@/components/CropSuggestionsScreen";
import { MyFieldsScreen } from "@/components/MyFieldsScreen";
import { getTranslation } from "@/lib/i18n";

export default function AppMain() {
  const { screen, lang } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* 60s Demo Mode Banner if active */}
      <DemoTourBanner />

      {/* Main Dynamic Screen View */}
      <main className="flex-1 pb-16">
        {screen === "LANGUAGE_SELECT" && <LanguageSelectScreen />}
        {screen === "HOME" && <HomeScreen />}
        {screen === "CONFIRM" && <ConfirmValuesScreen />}
        {screen === "CONTEXT" && <CropContextScreen />}
        {screen === "DASHBOARD" && <SoilDashboardScreen />}
        {screen === "ACTION_PLAN" && <ActionPlanScreen />}
        {screen === "SAVINGS" && <SavingsScreen />}
        {screen === "CROPS" && <CropSuggestionsScreen />}
        {screen === "HISTORY" && <MyFieldsScreen />}
      </main>

      {/* Sticky Bottom Audio & Share Bar */}
      <StickyBottomBar />

      {/* Mandatory Statutory Disclaimer Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500 mt-auto mb-14 sm:mb-0">
        <p className="max-w-md mx-auto leading-relaxed">
          {getTranslation("common.disclaimer", lang)}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          KrishiSaathi • Empowering smallholder farmers with scientific soil intelligence
        </p>
      </footer>
    </div>
  );
}
