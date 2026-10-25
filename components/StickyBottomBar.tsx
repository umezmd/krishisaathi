"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { getTranslation } from "@/lib/i18n";
import { generatePdfReport } from "@/lib/pdf";
import { Volume2, VolumeX, Share2, Download } from "lucide-react";

export function StickyBottomBar() {
  const { lang, screen, result, isSpeaking, speakCurrentPlan, stopVoice } = useApp();

  // Don't show sticky bar on language select or home screen unless a result exists
  const showBar = ["DASHBOARD", "ACTION_PLAN", "SAVINGS", "CROPS", "CONFIRM", "CONTEXT"].includes(
    screen
  );

  if (!showBar || !result) {
    return null;
  }

  const handleWhatsAppShare = () => {
    if (!result) return;
    const cropName = result.crop.names[lang] || result.crop.names.en;
    const savings = result.costComparison.totalSavings.toLocaleString("en-IN");
    const ureaBags = result.fertilizerPlan.ureaBags;
    const dapBags = result.fertilizerPlan.dapBags;
    const skipDap = result.fertilizerPlan.skipDap;

    let text = `🌾 *${getTranslation("appName", lang)} - ${getTranslation("savings.messagePreview", lang)}*\n\n`;
    text += `📍 *Field:* ${result.report.fieldName} (${result.landArea} ${result.landUnit})\n`;
    text += `🌱 *Crop:* ${cropName} (${result.season})\n`;
    text += `🏆 *Soil Health Score:* ${result.assessment.score}/100\n\n`;
    text += `💰 *MONEY SAVED:* ₹${savings} ${result.costComparison.savingsPerAcre ? `(₹${result.costComparison.savingsPerAcre}/acre)` : ""}\n\n`;
    text += `📦 *Recommended Fertilizer:*\n`;
    text += `• Urea (46% N): ${ureaBags} bags (50kg)\n`;
    if (skipDap) {
      text += `• DAP (18-46-0): ❌ DO NOT ADD (Soil is already rich in Phosphorus! Saves ₹2,700)\n`;
    } else {
      text += `• DAP (18-46-0): ${dapBags} bags (50kg)\n`;
    }
    if (result.fertilizerPlan.skipMop) {
      text += `• MOP Potash: ❌ DO NOT ADD (Sufficient natural reserves)\n`;
    }
    text += `\n🔗 Plan generated with KrishiSaathi - Soil Report to Action Plan`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    generatePdfReport(result);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-agri-border px-3 py-2.5 shadow-elevated"
      aria-label="Action Bar"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Listen Button (Hero Accessibility Feature) */}
        <button
          onClick={() => (isSpeaking ? stopVoice() : speakCurrentPlan())}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm min-h-[54px] ${
            isSpeaking
              ? "bg-amber-500 text-white animate-pulse ring-2 ring-amber-300"
              : "bg-agri-green text-white hover:bg-agri-green-dark active:scale-95"
          }`}
          aria-label={isSpeaking ? getTranslation("voice.stop", lang) : getTranslation("voice.listenPlan", lang)}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-5 h-5 text-white" />
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-white rounded animate-wave-1"></span>
                <span className="w-1 h-4 bg-white rounded animate-wave-2"></span>
                <span className="w-1 h-2 bg-white rounded animate-wave-3"></span>
              </div>
              <span className="text-xs truncate">{getTranslation("voice.stop", lang)}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-white animate-bounce" />
              <span className="text-xs sm:text-sm truncate">
                {getTranslation("voice.listenPlan", lang)}
              </span>
            </>
          )}
        </button>

        {/* Share on WhatsApp */}
        <button
          onClick={handleWhatsAppShare}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] text-white hover:bg-[#1EBE5D] active:scale-95 transition-all shadow-sm min-h-[54px]"
          aria-label={getTranslation("savings.shareWhatsApp", lang)}
        >
          <Share2 className="w-5 h-5" />
          <span className="text-xs sm:text-sm truncate">WhatsApp</span>
        </button>

        {/* Download PDF */}
        <button
          onClick={handleDownloadPdf}
          className="flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm bg-soil text-white hover:bg-soil-dark active:scale-95 transition-all shadow-sm min-h-[54px]"
          aria-label={getTranslation("savings.downloadPdf", lang)}
        >
          <Download className="w-5 h-5" />
          <span className="text-xs sm:text-sm truncate">PDF</span>
        </button>
      </div>
    </nav>
  );
}
