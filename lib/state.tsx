"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  CropInfo,
  FullActionPlanResult,
  LanguageCode,
  Season,
  SoilReport,
  WeatherAdvisory,
} from "@/types";
import { CROPS_DATABASE } from "@/data/crops";
import { SAMPLE_SOIL_CARDS } from "@/data/samples";
import { evaluateSoilReport } from "@/lib/rules";
import { calculateFertilizerPlan } from "@/lib/fertilizer";
import { calculateCostComparison } from "@/lib/cost";
import { fetchWeatherForecast } from "@/lib/weather";
import { speakText, stopSpeaking } from "@/lib/tts";

export type ScreenType =
  | "LANGUAGE_SELECT"
  | "HOME"
  | "SAMPLES"
  | "CONFIRM"
  | "CONTEXT"
  | "DASHBOARD"
  | "ACTION_PLAN"
  | "SAVINGS"
  | "CROPS"
  | "HISTORY";

interface AppContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  soilReport: SoilReport;
  setSoilReport: React.Dispatch<React.SetStateAction<SoilReport>>;
  reportImage: string | null;
  setReportImage: (img: string | null) => void;
  selectedCrop: CropInfo;
  setSelectedCrop: (crop: CropInfo) => void;
  landArea: number;
  setLandArea: (area: number) => void;
  landUnit: "acre" | "hectare";
  setLandUnit: (unit: "acre" | "hectare") => void;
  season: Season;
  setSeason: (season: Season) => void;
  result: FullActionPlanResult | null;
  savedFields: FullActionPlanResult[];
  saveCurrentField: () => void;
  deleteSavedField: (id: string) => void;
  loadFieldReport: (fieldResult: FullActionPlanResult) => void;
  loadSample: (sampleId: string) => void;
  computeFullPlan: (customReport?: SoilReport) => Promise<FullActionPlanResult>;
  weather: WeatherAdvisory | null;
  isSpeaking: boolean;
  speakCurrentPlan: (overrideText?: string) => void;
  stopVoice: () => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  demoStep: number;
  nextDemoStep: () => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
}

const defaultReport: SoilReport = { ...SAMPLE_SOIL_CARDS[0].report };

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>("en");
  const [screen, setScreen] = useState<ScreenType>("HOME");
  const [soilReport, setSoilReport] = useState<SoilReport>(defaultReport);
  const [reportImage, setReportImage] = useState<string | null>(SAMPLE_SOIL_CARDS[0].imagePath);
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(CROPS_DATABASE[0]);
  const [landArea, setLandArea] = useState<number>(2.0);
  const [landUnit, setLandUnit] = useState<"acre" | "hectare">("acre");
  const [season, setSeason] = useState<Season>("Rabi");
  const [result, setResult] = useState<FullActionPlanResult | null>(null);
  const [savedFields, setSavedFields] = useState<FullActionPlanResult[]>([]);
  const [weather, setWeather] = useState<WeatherAdvisory | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isDemoMode, setDemoMode] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Initialize from localStorage and auto-detect season
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("krishisaathi_lang") as LanguageCode | null;
      if (storedLang) {
        setLangState(storedLang);
      } else {
        // First launch: show language select
        setScreen("LANGUAGE_SELECT");
      }

      const storedFields = localStorage.getItem("krishisaathi_fields");
      if (storedFields) {
        setSavedFields(JSON.parse(storedFields));
      }

      // Determine season from current month
      // Kharif: June - Oct (months 5 - 9)
      // Rabi: Oct - March (months 9 - 2)
      // Zaid: March - June (months 2 - 5)
      const month = new Date().getMonth();
      if (month >= 5 && month <= 9) {
        setSeason("Kharif");
      } else if (month >= 2 && month < 5) {
        setSeason("Zaid");
      } else {
        setSeason("Rabi");
      }

      // Service worker registration
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // ignore in dev
        });
      }

      // Check online status
      const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);
      setIsOffline(!navigator.onLine);

      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    } catch {
      // Local storage not accessible in some environments
    }
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem("krishisaathi_lang", newLang);
    } catch {}
  };

  const loadSample = (sampleId: string) => {
    const sample = SAMPLE_SOIL_CARDS.find((s) => s.id === sampleId) || SAMPLE_SOIL_CARDS[0];
    setSoilReport({ ...sample.report });
    setReportImage(sample.imagePath);
    setLandArea(sample.defaultAcres);
    setLandUnit("acre");
    setSeason(sample.season);

    const matchCrop =
      CROPS_DATABASE.find((c) => c.id === sample.recommendedCropId) || CROPS_DATABASE[0];
    setSelectedCrop(matchCrop);

    // Compute plan immediately for instant demo
    computeFullPlan(sample.report);
    setScreen("CONFIRM");
  };

  const computeFullPlan = async (customReport?: SoilReport): Promise<FullActionPlanResult> => {
    const rep = customReport || soilReport;
    const assessment = evaluateSoilReport(rep);
    const fertilizerPlan = calculateFertilizerPlan(rep, selectedCrop, landArea, landUnit);
    const costComparison = calculateCostComparison(fertilizerPlan);

    // Fetch weather async
    let currentAdvisory = weather;
    if (!currentAdvisory) {
      currentAdvisory = await fetchWeatherForecast(30.901, 75.8573, rep.fieldName);
      setWeather(currentAdvisory);
    }

    const fullResult: FullActionPlanResult = {
      report: rep,
      crop: selectedCrop,
      landArea,
      landUnit,
      season,
      assessment,
      fertilizerPlan,
      costComparison,
      weather: currentAdvisory,
      isOfflineMode: isOffline,
    };

    setResult(fullResult);
    return fullResult;
  };

  const saveCurrentField = () => {
    if (!result) return;
    const existingIdx = savedFields.findIndex((f) => f.report.id === result.report.id);
    let updated: FullActionPlanResult[];
    if (existingIdx >= 0) {
      updated = [...savedFields];
      updated[existingIdx] = result;
    } else {
      updated = [result, ...savedFields];
    }
    setSavedFields(updated);
    try {
      localStorage.setItem("krishisaathi_fields", JSON.stringify(updated));
    } catch {}
  };

  const deleteSavedField = (id: string) => {
    const updated = savedFields.filter((f) => f.report.id !== id);
    setSavedFields(updated);
    try {
      localStorage.setItem("krishisaathi_fields", JSON.stringify(updated));
    } catch {}
  };

  const loadFieldReport = (fieldResult: FullActionPlanResult) => {
    setSoilReport(fieldResult.report);
    setSelectedCrop(fieldResult.crop);
    setLandArea(fieldResult.landArea);
    setLandUnit(fieldResult.landUnit);
    setSeason(fieldResult.season);
    setResult(fieldResult);
    setScreen("DASHBOARD");
  };

  const speakCurrentPlan = (overrideText?: string) => {
    if (isSpeaking) {
      stopVoice();
      return;
    }

    let speech = overrideText;
    if (!speech && result) {
      const cropName = result.crop.names[lang] || result.crop.names.en;
      const saving = result.costComparison.totalSavings;
      const skipDapText = result.fertilizerPlan.skipDap
        ? "Do not buy DAP. Save money."
        : `Apply ${result.fertilizerPlan.dapBags} bags of DAP.`;

      speech = `KrishiSaathi Soil Plan for ${cropName}. Total savings are ${saving} Rupees. Recommended Urea: ${result.fertilizerPlan.ureaBags} bags. ${skipDapText}`;
    }

    if (speech) {
      setIsSpeaking(true);
      speakText(
        speech,
        lang,
        {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        }
      );
    }
  };

  const stopVoice = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const nextDemoStep = () => {
    const tourScreens: ScreenType[] = ["HOME", "CONFIRM", "CONTEXT", "DASHBOARD", "ACTION_PLAN", "SAVINGS"];
    const nextIdx = (demoStep + 1) % tourScreens.length;
    setDemoStep(nextIdx);
    setScreen(tourScreens[nextIdx]);
    if (nextIdx === 0) {
      setDemoMode(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        screen,
        setScreen,
        soilReport,
        setSoilReport,
        reportImage,
        setReportImage,
        selectedCrop,
        setSelectedCrop,
        landArea,
        setLandArea,
        landUnit,
        setLandUnit,
        season,
        setSeason,
        result,
        savedFields,
        saveCurrentField,
        deleteSavedField,
        loadFieldReport,
        loadSample,
        computeFullPlan,
        weather,
        isSpeaking,
        speakCurrentPlan,
        stopVoice,
        isDemoMode,
        setDemoMode,
        demoStep,
        nextDemoStep,
        isOffline,
        setIsOffline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
