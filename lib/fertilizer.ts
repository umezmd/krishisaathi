import { CropInfo, FertilizerDosePlan, SoilReport } from "@/types";
import { SOIL_THRESHOLDS } from "@/data/thresholds";
import { classifyNitrogen, classifyPhosphorus, classifyPotassium } from "./rules";

const HA_TO_ACRE = 2.47105;
const ACRE_TO_HA = 0.404686;

/**
 * Calculates tailored fertilizer requirements and commercial fertilizer bags.
 * Correctly accounts for DAP's 18% N contribution before sizing Urea (46% N).
 */
export function calculateFertilizerPlan(
  report: SoilReport,
  crop: CropInfo,
  landArea: number,
  landUnit: "acre" | "hectare"
): FertilizerDosePlan {
  const safeArea = Math.max(0.1, landArea || 1.0);
  const areaInAcres = landUnit === "acre" ? safeArea : safeArea * HA_TO_ACRE;
  const areaInHectares = landUnit === "hectare" ? safeArea : safeArea * ACRE_TO_HA;

  // 1. Determine nutrient adjustment factor based on soil test
  const nRating = classifyNitrogen(report.nitrogen).rating;
  const pRating = classifyPhosphorus(report.phosphorus).rating;
  const kRating = classifyPotassium(report.potassium).rating;

  // Low = 125%, Medium = 100%, High = 50% (or 0 for P/K to save cost)
  let nFactor = 1.0;
  if (nRating === "LOW") nFactor = 1.25;
  else if (nRating === "HIGH") nFactor = 0.6;

  let pFactor = 1.0;
  let skipDap = false;
  if (pRating === "LOW") {
    pFactor = 1.25;
  } else if (pRating === "HIGH") {
    pFactor = 0.0;
    skipDap = true;
  }

  let kFactor = 1.0;
  let skipMop = false;
  if (kRating === "LOW") {
    kFactor = 1.25;
  } else if (kRating === "HIGH") {
    kFactor = 0.0;
    skipMop = true;
  }

  // Adjusted nutrient targets per hectare
  const targetN_kgha = Math.round(crop.baseN * nFactor);
  const targetP2O5_kgha = Math.round(crop.baseP2O5 * pFactor);
  const targetK2O_kgha = Math.round(crop.baseK2O * kFactor);

  // Field totals
  const targetN_total = Math.round(targetN_kgha * areaInHectares);
  const targetP2O5_total = Math.round(targetP2O5_kgha * areaInHectares);
  const targetK2O_total = Math.round(targetK2O_kgha * areaInHectares);

  // 2. Commercial fertilizer conversions
  // DAP (18% N, 46% P2O5)
  let dapKg = 0;
  let dapBags = 0;
  let dapNSuppliedKg = 0;

  if (!skipDap && targetP2O5_total > 0) {
    dapKg = Math.round(targetP2O5_total / 0.46);
    dapNSuppliedKg = Math.round(dapKg * 0.18);
    dapBags = Number((dapKg / 50).toFixed(1));
  }

  // SSP alternative (16% P2O5)
  const sspKg = !skipDap && targetP2O5_total > 0 ? Math.round(targetP2O5_total / 0.16) : 0;
  const sspBags = Number((sspKg / 50).toFixed(1));

  // Urea (46% N) -> balance of N remaining after DAP
  const netN_NeededTotal = Math.max(0, targetN_total - dapNSuppliedKg);
  const skipUrea = netN_NeededTotal <= 5;
  let ureaKg = 0;
  let ureaBags = 0;

  if (!skipUrea) {
    ureaKg = Math.round(netN_NeededTotal / 0.46);
    ureaBags = Number((ureaKg / 50).toFixed(1));
  }

  // MOP (60% K2O)
  let mopKg = 0;
  let mopBags = 0;
  if (!skipMop && targetK2O_total > 0) {
    mopKg = Math.round(targetK2O_total / 0.6);
    mopBags = Number((mopKg / 50).toFixed(1));
  }

  // "Do NOT add" alerts
  const doNotAddList: Array<{
    nutrient: string;
    product: string;
    reason: string;
  }> = [];

  if (skipDap) {
    doNotAddList.push({
      nutrient: "Phosphorus (P)",
      product: "DAP / SSP",
      reason: `Available Phosphorus is already HIGH (${report.phosphorus} kg/ha). Adding more locks up micronutrients and wastes ₹1,350 per bag.`,
    });
  }

  if (skipMop) {
    doNotAddList.push({
      nutrient: "Potassium (K)",
      product: "MOP (Potash)",
      reason: `Available Potassium is already HIGH (${report.potassium} kg/ha). Soil has abundant natural reserves. Skip to save ₹1,700 per bag.`,
    });
  }

  if (nRating === "HIGH") {
    doNotAddList.push({
      nutrient: "Excess Nitrogen",
      product: "Extra Urea",
      reason: `Soil Nitrogen is already HIGH (${report.nitrogen} kg/ha). Excess urea causes plant lodging, attracts pests (aphids/borers), and delays maturity.`,
    });
  }

  // Amendments
  const amendments: Array<{
    name: string;
    product: string;
    amountKg: number;
    amountUnit: string;
    reason: string;
    timing: string;
  }> = [];

  // Acidic soil (< 6.5) -> Agricultural Lime
  if (report.ph < SOIL_THRESHOLDS.ph.acidic) {
    const limeRatePerAcre = report.ph < 5.5 ? 400 : 250;
    const totalLime = Math.round(limeRatePerAcre * areaInAcres);
    amendments.push({
      name: "Soil Acidity Corrector",
      product: "Agricultural Lime (CaCO3)",
      amountKg: totalLime,
      amountUnit: `${totalLime} kg (${Math.ceil(totalLime / 50)} bags)`,
      reason: `Soil pH is ${report.ph} (Acidic). Lime neutralizes acid toxicity and activates locked nutrients.`,
      timing: "Broadcast & incorporate into soil 2-3 weeks before sowing.",
    });
  }

  // Alkaline/Sodic soil (> 8.0 or EC > 1.5) -> Gypsum
  if (report.ph > 8.0 || report.ec > 1.5) {
    const gypsumRatePerAcre = 250;
    const totalGypsum = Math.round(gypsumRatePerAcre * areaInAcres);
    amendments.push({
      name: "Soil Salinity / Alkalinity Corrector",
      product: "Agricultural Gypsum (CaSO4)",
      amountKg: totalGypsum,
      amountUnit: `${totalGypsum} kg (${Math.ceil(totalGypsum / 50)} bags)`,
      reason: `High pH (${report.ph}) or salinity (${report.ec} dS/m). Gypsum replaces excess sodium with calcium to restore soil drainage.`,
      timing: "Apply during field preparation followed by irrigation.",
    });
  }

  // Low Organic Carbon (< 0.5%) -> FYM / Compost
  if (report.organicCarbon < SOIL_THRESHOLDS.organicCarbon.mediumMax) {
    const fymTons = Math.round(2.5 * areaInAcres * 10) / 10;
    amendments.push({
      name: "Organic Carbon Enhancer",
      product: "Well-rotted FYM / Vermicompost",
      amountKg: fymTons * 1000,
      amountUnit: `${fymTons} tonnes`,
      reason: `Organic Carbon is low (${report.organicCarbon}%). Organic matter improves moisture retention and fertilizer response.`,
      timing: "Incorporate into topsoil during last ploughing.",
    });
  }

  // Zinc deficiency (< 0.6 ppm)
  if (report.zinc !== null && report.zinc !== undefined && report.zinc < 0.6) {
    const znTotalKg = Math.round(10 * areaInAcres);
    amendments.push({
      name: "Micronutrient Supplement",
      product: "Zinc Sulphate (ZnSO4 21%)",
      amountKg: znTotalKg,
      amountUnit: `${znTotalKg} kg`,
      reason: `Zinc is deficient (${report.zinc} ppm). Crucial for leaf chlorophyll and enzyme production.`,
      timing: "Basal dose with basal fertilizer (do not mix directly with DAP in same bowl).",
    });
  }

  // Sulphur deficiency (< 10 ppm)
  if (report.sulphur !== null && report.sulphur !== undefined && report.sulphur < 10) {
    const sTotalKg = Math.round(12 * areaInAcres);
    amendments.push({
      name: "Sulphur Boost",
      product: "Bentonite Sulphate (90% S) or SSP",
      amountKg: sTotalKg,
      amountUnit: `${sTotalKg} kg`,
      reason: `Sulphur is deficient (${report.sulphur} ppm). Essential for oil synthesis and protein content.`,
      timing: "Apply at final land preparation.",
    });
  }

  // 3. Application Schedule (Basal, 21 Days, 45 Days)
  // Split Urea: 1/3 at basal, 1/3 at 21 days, 1/3 at 45 days (or 50:50 if legume)
  const isLegume = crop.id === "soybean" || crop.id === "groundnut" || crop.id === "chickpea";
  const basalUreaRatio = isLegume ? 1.0 : 0.35;
  const vegetativeUreaRatio = isLegume ? 0.0 : 0.35;
  const floweringUreaRatio = isLegume ? 0.0 : 0.30;

  const basalUreaKg = Math.round(ureaKg * basalUreaRatio);
  const vegUreaKg = Math.round(ureaKg * vegetativeUreaRatio);
  const flowUreaKg = Math.max(0, ureaKg - basalUreaKg - vegUreaKg);

  const schedule: FertilizerDosePlan["schedule"] = [
    {
      stage: "BASAL",
      stageName: "Before Sowing (Basal)",
      daysAfterSowing: "Day 0 (At Sowing)",
      fertilizers: [
        ...(dapKg > 0
          ? [
              {
                product: "DAP (Di-Ammonium Phosphate)",
                amountKg: dapKg,
                bags: dapBags,
                notes: "Apply 100% of DAP in furrows 5 cm below seed line.",
              },
            ]
          : []),
        ...(mopKg > 0
          ? [
              {
                product: "MOP (Potash)",
                amountKg: mopKg,
                bags: mopBags,
                notes: "Apply full dose at sowing for strong root establishment.",
              },
            ]
          : []),
        ...(basalUreaKg > 0
          ? [
              {
                product: "Urea (Nitrogen Starter)",
                amountKg: basalUreaKg,
                bags: Number((basalUreaKg / 50).toFixed(1)),
                notes: "Starter nitrogen for seedling emergence.",
              },
            ]
          : []),
      ],
    },
    {
      stage: "VEGETATIVE",
      stageName: "First Top-Dressing",
      daysAfterSowing: "Day 21 - 25 (Tillering / Branching)",
      fertilizers:
        vegUreaKg > 0
          ? [
              {
                product: "Urea (Nitrogen Boost)",
                amountKg: vegUreaKg,
                bags: Number((vegUreaKg / 50).toFixed(1)),
                notes: "Broadcast when soil is moist. Avoid applying right before heavy rains.",
              },
            ]
          : [],
    },
    {
      stage: "FLOWERING",
      stageName: "Second Top-Dressing",
      daysAfterSowing: "Day 45 - 50 (Panicle / Pre-flowering)",
      fertilizers:
        flowUreaKg > 0
          ? [
              {
                product: "Urea (Yield & Grain Filling)",
                amountKg: flowUreaKg,
                bags: Number((flowUreaKg / 50).toFixed(1)),
                notes: "Top dress after weeding. Ensure light irrigation after application.",
              },
            ]
          : [],
    },
  ];

  return {
    cropId: crop.id,
    landArea: safeArea,
    landUnit,
    areaInAcres: Number(areaInAcres.toFixed(2)),
    areaInHectares: Number(areaInHectares.toFixed(2)),
    targetN_kgha,
    targetP2O5_kgha,
    targetK2O_kgha,
    targetN_total,
    targetP2O5_total,
    targetK2O_total,
    dapKg,
    dapBags,
    dapNSuppliedKg,
    sspKg,
    sspBags,
    ureaKg,
    ureaBags,
    mopKg,
    mopBags,
    skipDap,
    skipUrea,
    skipMop,
    doNotAddList,
    amendments,
    schedule,
  };
}
