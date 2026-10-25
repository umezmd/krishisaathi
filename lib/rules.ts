import { SOIL_THRESHOLDS } from "@/data/thresholds";
import {
  SoilReport,
  SoilHealthAssessment,
  ParameterAssessment,
  PHRating,
  ECRating,
  NutrientRating,
  MicroRating,
} from "@/types";

/**
 * Classifies soil pH based on Indian Soil Health Card criteria.
 */
export function classifyPH(ph: number): {
  rating: PHRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (ph < SOIL_THRESHOLDS.ph.acidic) {
    return {
      rating: "ACIDIC",
      status: "warning",
      meaning: "Soil is acidic. Nutrient uptake (especially P) is restricted. Lime recommended.",
    };
  }
  if (ph <= SOIL_THRESHOLDS.ph.neutralMax) {
    return {
      rating: "NEUTRAL",
      status: "success",
      meaning: "Ideal neutral pH. Optimum availability for all major and micro nutrients.",
    };
  }
  if (ph <= SOIL_THRESHOLDS.ph.alkalineMax) {
    return {
      rating: "ALKALINE",
      status: "warning",
      meaning: "Alkaline soil. Phosphorus and micronutrient availability may be reduced.",
    };
  }
  return {
    rating: "STRONGLY_ALKALINE",
    status: "danger",
    meaning: "Strongly alkaline/sodic soil. High risk of salinity; gypsum treatment needed.",
  };
}

/**
 * Classifies Electrical Conductivity (EC in dS/m)
 */
export function classifyEC(ec: number): {
  rating: ECRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (ec < SOIL_THRESHOLDS.ec.safe) {
    return {
      rating: "SAFE",
      status: "success",
      meaning: "Safe electrical conductivity. Normal seed germination and root growth.",
    };
  }
  if (ec <= SOIL_THRESHOLDS.ec.slightlySalineMax) {
    return {
      rating: "SLIGHTLY_SALINE",
      status: "warning",
      meaning: "Slightly saline. Sensitive crops may show reduced yield. Ensure good drainage.",
    };
  }
  return {
    rating: "SALINE",
    status: "danger",
    meaning: "High salinity. Toxic salt concentration; requires leaching and salt-tolerant crops.",
  };
}

/**
 * Classifies Organic Carbon (%)
 */
export function classifyOrganicCarbon(oc: number): {
  rating: NutrientRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (oc < SOIL_THRESHOLDS.organicCarbon.lowMax) {
    return {
      rating: "LOW",
      status: "danger",
      meaning: "Low organic carbon. Poor microbial life and water retention. Add FYM/compost.",
    };
  }
  if (oc <= SOIL_THRESHOLDS.organicCarbon.mediumMax) {
    return {
      rating: "MEDIUM",
      status: "warning",
      meaning: "Moderate organic carbon. Maintain with crop residues and green manuring.",
    };
  }
  return {
    rating: "HIGH",
    status: "success",
    meaning: "High organic carbon. Excellent soil structure, biology, and moisture capacity.",
  };
}

/**
 * Classifies Available Nitrogen (kg/ha)
 */
export function classifyNitrogen(n: number): {
  rating: NutrientRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (n < SOIL_THRESHOLDS.nitrogen.lowMax) {
    return {
      rating: "LOW",
      status: "danger",
      meaning: "Low Nitrogen. Stunted crop growth and pale yellow leaves expected.",
    };
  }
  if (n <= SOIL_THRESHOLDS.nitrogen.mediumMax) {
    return {
      rating: "MEDIUM",
      status: "success",
      meaning: "Adequate Nitrogen. Normal vegetative growth expected.",
    };
  }
  return {
    rating: "HIGH",
    status: "warning",
    meaning: "High Nitrogen. Risk of lodging, pest attacks, and delayed maturity. Reduce Urea.",
  };
}

/**
 * Classifies Available Phosphorus (kg/ha)
 */
export function classifyPhosphorus(p: number): {
  rating: NutrientRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (p < SOIL_THRESHOLDS.phosphorus.lowMax) {
    return {
      rating: "LOW",
      status: "danger",
      meaning: "Low Phosphorus. Poor root development and delayed flowering.",
    };
  }
  if (p <= SOIL_THRESHOLDS.phosphorus.mediumMax) {
    return {
      rating: "MEDIUM",
      status: "success",
      meaning: "Medium Phosphorus. Healthy root establishment.",
    };
  }
  return {
    rating: "HIGH",
    status: "warning",
    meaning: "High Phosphorus. Soil is saturated! DO NOT apply DAP/SSP. Huge money saving.",
  };
}

/**
 * Classifies Available Potassium (kg/ha)
 */
export function classifyPotassium(k: number): {
  rating: NutrientRating;
  status: "danger" | "warning" | "success";
  meaning: string;
} {
  if (k < SOIL_THRESHOLDS.potassium.lowMax) {
    return {
      rating: "LOW",
      status: "danger",
      meaning: "Low Potassium. Reduced drought and pest resistance, weaker stems.",
    };
  }
  if (k <= SOIL_THRESHOLDS.potassium.mediumMax) {
    return {
      rating: "MEDIUM",
      status: "success",
      meaning: "Medium Potassium. Good disease resistance and grain filling.",
    };
  }
  return {
    rating: "HIGH",
    status: "warning",
    meaning: "High Potassium. Soil has plenty of Potash. DO NOT apply MOP fertilizer.",
  };
}

/**
 * Classifies micronutrients (ppm)
 */
export function classifyMicronutrient(
  key: keyof typeof SOIL_THRESHOLDS.micronutrients,
  val: number | null | undefined
): {
  rating: MicroRating;
  status: "danger" | "warning" | "success" | "neutral";
  meaning: string;
} {
  if (val === null || val === undefined || isNaN(val)) {
    return {
      rating: "NOT_TESTED",
      status: "neutral",
      meaning: "Not tested in this soil report.",
    };
  }
  const meta = SOIL_THRESHOLDS.micronutrients[key];
  if (val < meta.critical) {
    return {
      rating: "DEFICIENT",
      status: "danger",
      meaning: `Deficient (<${meta.critical} ${meta.unit}). Yield loss likely without foliar/soil supplement.`,
    };
  }
  return {
    rating: "SUFFICIENT",
    status: "success",
    meaning: `Sufficient (>=${meta.critical} ${meta.unit}). Meets crop physiological demand.`,
  };
}

/**
 * Calculates a comprehensive Soil Health Score (0 - 100)
 * Weighted:
 * - pH balance: 20 pts
 * - EC safety: 15 pts
 * - Organic Carbon: 20 pts
 * - Macronutrients (N, P, K): 15 pts each (45 total)
 */
export function calculateSoilHealthScore(report: SoilReport): number {
  let score = 0;

  // 1. pH (ideal 6.5 - 7.5 gets 20, 6.0-6.5 or 7.5-8.0 gets 14, else 6)
  if (report.ph >= 6.5 && report.ph <= 7.5) {
    score += 20;
  } else if (
    (report.ph >= 6.0 && report.ph < 6.5) ||
    (report.ph > 7.5 && report.ph <= 8.2)
  ) {
    score += 14;
  } else {
    score += 6;
  }

  // 2. EC (safe < 1 gets 15, 1-2 gets 8, > 2 gets 2)
  if (report.ec < 1.0) {
    score += 15;
  } else if (report.ec <= 2.0) {
    score += 8;
  } else {
    score += 2;
  }

  // 3. Organic Carbon (> 0.75 gets 20, 0.5-0.75 gets 14, < 0.5 gets 6)
  if (report.organicCarbon > 0.75) {
    score += 20;
  } else if (report.organicCarbon >= 0.5) {
    score += 14;
  } else {
    score += 6;
  }

  // 4. Nitrogen (medium gets 15, low gets 8, high gets 12)
  if (report.nitrogen >= 280 && report.nitrogen <= 560) {
    score += 15;
  } else if (report.nitrogen < 280) {
    score += 8;
  } else {
    score += 12;
  }

  // 5. Phosphorus (medium gets 15, low gets 7, high gets 13)
  if (report.phosphorus >= 10 && report.phosphorus <= 25) {
    score += 15;
  } else if (report.phosphorus < 10) {
    score += 7;
  } else {
    score += 13;
  }

  // 6. Potassium (medium gets 15, low gets 8, high gets 13)
  if (report.potassium >= 108 && report.potassium <= 280) {
    score += 15;
  } else if (report.potassium < 108) {
    score += 8;
  } else {
    score += 13;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Full deterministic soil evaluation
 */
export function evaluateSoilReport(report: SoilReport): SoilHealthAssessment {
  const phRes = classifyPH(report.ph);
  const ecRes = classifyEC(report.ec);
  const ocRes = classifyOrganicCarbon(report.organicCarbon);
  const nRes = classifyNitrogen(report.nitrogen);
  const pRes = classifyPhosphorus(report.phosphorus);
  const kRes = classifyPotassium(report.potassium);

  const parameters: ParameterAssessment[] = [
    {
      param: "ph",
      name: "pH (Soil Reaction)",
      value: report.ph,
      unit: "pH",
      rating: phRes.rating,
      status: phRes.status,
      meaning: phRes.meaning,
      benchmark: "6.5 - 7.5 Ideal",
    },
    {
      param: "ec",
      name: "Electrical Conductivity (EC)",
      value: report.ec,
      unit: "dS/m",
      rating: ecRes.rating,
      status: ecRes.status,
      meaning: ecRes.meaning,
      benchmark: "< 1.0 Safe",
    },
    {
      param: "organicCarbon",
      name: "Organic Carbon (OC)",
      value: report.organicCarbon,
      unit: "%",
      rating: ocRes.rating,
      status: ocRes.status,
      meaning: ocRes.meaning,
      benchmark: "> 0.75% High",
    },
    {
      param: "nitrogen",
      name: "Available Nitrogen (N)",
      value: report.nitrogen,
      unit: "kg/ha",
      rating: nRes.rating,
      status: nRes.status,
      meaning: nRes.meaning,
      benchmark: "280 - 560 Medium",
    },
    {
      param: "phosphorus",
      name: "Available Phosphorus (P)",
      value: report.phosphorus,
      unit: "kg/ha",
      rating: pRes.rating,
      status: pRes.status,
      meaning: pRes.meaning,
      benchmark: "10 - 25 Medium",
    },
    {
      param: "potassium",
      name: "Available Potassium (K)",
      value: report.potassium,
      unit: "kg/ha",
      rating: kRes.rating,
      status: kRes.status,
      meaning: kRes.meaning,
      benchmark: "108 - 280 Medium",
    },
  ];

  // Optional Micronutrients
  const micros: Array<{
    key: keyof typeof SOIL_THRESHOLDS.micronutrients;
    param: keyof SoilReport;
    name: string;
  }> = [
    { key: "sulphur", param: "sulphur", name: "Sulphur (S)" },
    { key: "zinc", param: "zinc", name: "Zinc (Zn)" },
    { key: "iron", param: "iron", name: "Iron (Fe)" },
    { key: "copper", param: "copper", name: "Copper (Cu)" },
    { key: "manganese", param: "manganese", name: "Manganese (Mn)" },
    { key: "boron", param: "boron", name: "Boron (B)" },
  ];

  const deficientMicros: string[] = [];

  for (const m of micros) {
    const val = report[m.param] as number | undefined | null;
    const res = classifyMicronutrient(m.key, val);
    if (res.rating === "DEFICIENT") {
      deficientMicros.push(m.name);
    }
    parameters.push({
      param: m.param,
      name: m.name,
      value: val,
      unit: "ppm",
      rating: res.rating,
      status: res.status,
      meaning: res.meaning,
      benchmark: `>= ${SOIL_THRESHOLDS.micronutrients[m.key].critical} ppm`,
    });
  }

  const score = calculateSoilHealthScore(report);
  const needsLime = report.ph < SOIL_THRESHOLDS.ph.acidic;
  const needsGypsum = report.ph > 8.0 || report.ec > 1.5;
  const needsOrganicMatter = report.organicCarbon < SOIL_THRESHOLDS.organicCarbon.mediumMax;

  let summary = "Good general soil fertility condition.";
  if (score >= 80) {
    summary = "Healthy, well-balanced soil with high productivity potential!";
  } else if (score >= 60) {
    summary = "Moderate soil health. Minor nutrient corrections will unlock top yields.";
  } else {
    summary = "Degraded or unbalanced soil. Requires structured soil amendments and balanced nutrition.";
  }

  return {
    score,
    summary,
    parameters,
    needsLime,
    needsGypsum,
    needsOrganicMatter,
    deficientMicros,
  };
}
