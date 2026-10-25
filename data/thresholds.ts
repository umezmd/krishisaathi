/**
 * Indian Soil Health Card (SHC) Standard Thresholds
 * Source: Ministry of Agriculture & Farmers Welfare, Government of India
 * Operational Guidelines on Soil Health Card Scheme
 */

export const SOIL_THRESHOLDS = {
  ph: {
    acidic: 6.5,
    neutralMax: 7.5,
    alkalineMax: 8.5,
    labels: {
      acidic: "ACIDIC",
      neutral: "NEUTRAL",
      alkaline: "ALKALINE",
      stronglyAlkaline: "STRONGLY_ALKALINE",
    },
  },
  ec: {
    // Electrical Conductivity in dS/m
    safe: 1.0,
    slightlySalineMax: 2.0,
    labels: {
      safe: "SAFE",
      slightlySaline: "SLIGHTLY_SALINE",
      saline: "SALINE",
    },
  },
  organicCarbon: {
    // Organic Carbon %
    lowMax: 0.5,
    mediumMax: 0.75,
    labels: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
  },
  nitrogen: {
    // Available Nitrogen in kg/ha
    lowMax: 280,
    mediumMax: 560,
    labels: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
  },
  phosphorus: {
    // Available Phosphorus (P2O5 equivalent) in kg/ha
    lowMax: 10,
    mediumMax: 25,
    labels: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
  },
  potassium: {
    // Available Potassium (K2O equivalent) in kg/ha
    lowMax: 108,
    mediumMax: 280,
    labels: {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
    },
  },
  // Micronutrient deficiency critical limits (ppm / mg/kg)
  micronutrients: {
    sulphur: { critical: 10.0, unit: "ppm" },
    zinc: { critical: 0.6, unit: "ppm" },
    iron: { critical: 4.5, unit: "ppm" },
    copper: { critical: 0.2, unit: "ppm" },
    manganese: { critical: 1.0, unit: "ppm" },
    boron: { critical: 0.5, unit: "ppm" },
  },
} as const;
