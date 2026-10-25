import { LanguageCode, LanguageInfo } from "@/types";
import en from "@/data/translations/en.json";
import hi from "@/data/translations/hi.json";
import te from "@/data/translations/te.json";
import ta from "@/data/translations/ta.json";
import mr from "@/data/translations/mr.json";
import kn from "@/data/translations/kn.json";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    speechCode: "en-IN",
    flagLabel: "EN",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    speechCode: "hi-IN",
    flagLabel: "हि",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    speechCode: "te-IN",
    flagLabel: "తె",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    speechCode: "ta-IN",
    flagLabel: "த",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    speechCode: "mr-IN",
    flagLabel: "म",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    flagLabel: "ಕ",
  },
];

export const TRANSLATIONS: Record<LanguageCode, typeof en> = {
  en,
  hi: hi as unknown as typeof en,
  te: te as unknown as typeof en,
  ta: ta as unknown as typeof en,
  mr: mr as unknown as typeof en,
  kn: kn as unknown as typeof en,
};

/**
 * Access translated strings safely via dot notation (e.g., 'home.scanCard')
 */
export function getTranslation(key: string, lang: LanguageCode = "en"): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallbackCurrent: any = TRANSLATIONS.en;
      for (const fallbackPart of parts) {
        if (
          fallbackCurrent &&
          typeof fallbackCurrent === "object" &&
          fallbackPart in fallbackCurrent
        ) {
          fallbackCurrent = fallbackCurrent[fallbackPart];
        } else {
          return key;
        }
      }
      return typeof fallbackCurrent === "string" ? fallbackCurrent : key;
    }
  }

  return typeof current === "string" ? current : key;
}

/**
 * Formats currency in Indian numbering system (e.g. ₹2,700)
 */
export function formatRupees(amount: number): string {
  const safe = Math.round(amount);
  return `₹${safe.toLocaleString("en-IN")}`;
}
