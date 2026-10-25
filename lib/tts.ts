import { LanguageCode } from "@/types";
import { SUPPORTED_LANGUAGES } from "./i18n";

export interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  currentLang: LanguageCode;
}

/**
 * Clean plain text for natural spoken narration (removes symbols, markdown, brackets)
 */
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/₹/g, " Rupees ")
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[\/\\]/g, " ")
    .replace(/kg\/ha/gi, " kilogram per hectare ")
    .replace(/kg/gi, " kilogram ")
    .replace(/ppm/gi, " parts per million ")
    .replace(/dS\/m/gi, " deci-siemens per meter ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Speaks text aloud in the requested Indian regional language using Web Speech API
 */
export function speakText(
  text: string,
  langCode: LanguageCode,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("SpeechSynthesis not supported in this browser.");
    callbacks?.onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  const speechCode = langInfo ? langInfo.speechCode : "en-IN";

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    callbacks?.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = speechCode;
  utterance.rate = 0.95; // slightly slower for maximum clarity for rural farmers
  utterance.pitch = 1.0;

  // Attempt to select an exact or regional voice
  const voices = window.speechSynthesis.getVoices();
  const regionalVoice = voices.find(
    (v) =>
      v.lang.toLowerCase() === speechCode.toLowerCase() ||
      v.lang.toLowerCase().startsWith(langCode)
  );

  if (regionalVoice) {
    utterance.voice = regionalVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn("TTS Error:", e);
    callbacks?.onEnd?.();
    callbacks?.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any speech currently in progress
 */
export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
