export type LanguageCode = "en" | "hi" | "te" | "ta" | "mr" | "kn";

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechCode: string; // e.g. hi-IN
  flagLabel: string;
}

export interface SoilReport {
  id: string;
  fieldName: string;
  date: string;
  ph: number;
  ec: number; // dS/m
  organicCarbon: number; // %
  nitrogen: number; // kg/ha (Available N)
  phosphorus: number; // kg/ha (Available P)
  potassium: number; // kg/ha (Available K)
  sulphur?: number | null; // ppm
  zinc?: number | null; // ppm
  iron?: number | null; // ppm
  copper?: number | null; // ppm
  manganese?: number | null; // ppm
  boron?: number | null; // ppm
}

export type PHRating = "ACIDIC" | "NEUTRAL" | "ALKALINE" | "STRONGLY_ALKALINE";
export type ECRating = "SAFE" | "SLIGHTLY_SALINE" | "SALINE";
export type NutrientRating = "LOW" | "MEDIUM" | "HIGH";
export type MicroRating = "DEFICIENT" | "SUFFICIENT" | "NOT_TESTED";

export interface ParameterAssessment {
  param: keyof SoilReport;
  name: string;
  value: number | null | undefined;
  unit: string;
  rating: string; // "LOW" | "MEDIUM" | "HIGH" | "ACIDIC" | "DEFICIENT" etc.
  status: "danger" | "warning" | "success" | "neutral";
  meaning: string;
  benchmark: string;
}

export interface SoilHealthAssessment {
  score: number; // 0 - 100
  summary: string;
  parameters: ParameterAssessment[];
  needsLime: boolean;
  needsGypsum: boolean;
  needsOrganicMatter: boolean;
  deficientMicros: string[];
}

export type Season = "Kharif" | "Rabi" | "Zaid";

export interface CropInfo {
  id: string;
  nameKey: string;
  names: Record<LanguageCode, string>;
  icon: string; // emoji or icon name
  seasons: Season[];
  idealPhRange: [number, number];
  salinityTolerance: "low" | "medium" | "high";
  // Base requirement in kg/ha of N, P2O5, K2O
  baseN: number;
  baseP2O5: number;
  baseK2O: number;
  description: string;
}

export interface FertilizerDosePlan {
  cropId: string;
  landArea: number; // numeric value
  landUnit: "acre" | "hectare";
  areaInAcres: number;
  areaInHectares: number;

  // Nutrient requirements for this soil + crop (kg/ha and total for field)
  targetN_kgha: number;
  targetP2O5_kgha: number;
  targetK2O_kgha: number;

  targetN_total: number;
  targetP2O5_total: number;
  targetK2O_total: number;

  // Commercial fertilizers recommended for entire field
  dapKg: number;
  dapBags: number; // 50kg bags
  dapNSuppliedKg: number;

  sspKg: number;
  sspBags: number;

  ureaKg: number;
  ureaBags: number;

  mopKg: number;
  mopBags: number;

  // Warnings / "Do Not Add"
  skipDap: boolean;
  skipUrea: boolean;
  skipMop: boolean;
  doNotAddList: Array<{
    nutrient: string;
    product: string;
    reason: string;
  }>;

  // Amendments
  amendments: Array<{
    name: string;
    product: string;
    amountKg: number;
    amountUnit: string;
    reason: string;
    timing: string;
  }>;

  // Split dose schedule
  schedule: Array<{
    stage: "BASAL" | "VEGETATIVE" | "FLOWERING";
    stageName: string;
    daysAfterSowing: string;
    fertilizers: Array<{
      product: string;
      amountKg: number;
      bags: number;
      notes: string;
    }>;
  }>;
}

export interface CostComparison {
  typicalCost: number;
  recommendedCost: number;
  totalSavings: number;
  savingsPerAcre: number;
  savingsPercentage: number;
  dapSavings: number;
  ureaSavings: number;
  typicalBags: {
    ureaBags: number;
    dapBags: number;
    mopBags: number;
  };
  recommendedBags: {
    ureaBags: number;
    dapBags: number;
    sspBags: number;
    mopBags: number;
  };
  prices: {
    urea50kg: number;
    dap50kg: number;
    ssp50kg: number;
    mop50kg: number;
  };
}

export interface CropSuitability {
  crop: CropInfo;
  score: number; // 0 - 100
  matchReasons: string[];
  riskWarnings: string[];
  isRecommended: boolean;
}

export interface WeatherAdvisory {
  city: string;
  temp: number;
  condition: string;
  rainNext3DaysMm: number;
  hasHeavyRainWarning: boolean;
  hasHeatWarning: boolean;
  advisoryText: string;
}

export interface FullActionPlanResult {
  report: SoilReport;
  crop: CropInfo;
  landArea: number;
  landUnit: "acre" | "hectare";
  season: Season;
  assessment: SoilHealthAssessment;
  fertilizerPlan: FertilizerDosePlan;
  costComparison: CostComparison;
  weather?: WeatherAdvisory;
  aiExplanation?: string;
  isOfflineMode?: boolean;
}
