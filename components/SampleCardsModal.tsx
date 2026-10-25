"use client";

import React from "react";
import { useApp } from "@/lib/state";
import { SAMPLE_SOIL_CARDS } from "@/data/samples";
import { getTranslation } from "@/lib/i18n";
import { X, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface SampleCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SampleCardsModal({ isOpen, onClose }: SampleCardsModalProps) {
  const { lang, loadSample } = useApp();

  if (!isOpen) return null;

  const handleSelectSample = (id: string) => {
    loadSample(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-elevated border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
              {getTranslation("samples.title", lang)}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {getTranslation("samples.subtitle", lang)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3.5 my-4">
          {SAMPLE_SOIL_CARDS.map((card, idx) => (
            <button
              key={card.id}
              type="button"
              data-sample-id={card.id}
              onClick={() => handleSelectSample(card.id)}
              className="w-full text-left group cursor-pointer rounded-2xl border-2 border-gray-200 hover:border-agri-green bg-agri-bg/40 hover:bg-green-50/60 p-4 transition-all shadow-sm hover:shadow-soft active:scale-98 block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-agri-green/10 text-agri-green">
                      {card.region}
                    </span>
                    <span className="text-xs font-semibold text-soil">
                      {card.defaultAcres} Acres ({card.season})
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 mt-1.5 group-hover:text-agri-green transition-colors">
                    {idx === 0
                      ? getTranslation("samples.sample1Title", lang)
                      : idx === 1
                      ? getTranslation("samples.sample2Title", lang)
                      : getTranslation("samples.sample3Title", lang)}
                  </h3>

                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {idx === 0
                      ? getTranslation("samples.sample1Desc", lang)
                      : idx === 1
                      ? getTranslation("samples.sample2Desc", lang)
                      : getTranslation("samples.sample3Desc", lang)}
                  </p>

                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <span>💡</span>
                    <span>{card.heroHighlight}</span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-white group-hover:bg-agri-green group-hover:text-white flex items-center justify-center text-gray-400 transition-colors shadow-sm self-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-800 font-medium py-2"
          >
            {getTranslation("common.close", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
