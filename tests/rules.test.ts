import { describe, it, expect } from "vitest";
import {
  classifyPH,
  classifyEC,
  classifyOrganicCarbon,
  classifyNitrogen,
  classifyPhosphorus,
  classifyPotassium,
  classifyMicronutrient,
  calculateSoilHealthScore,
  evaluateSoilReport,
} from "../lib/rules";
import { calculateFertilizerPlan } from "../lib/fertilizer";
import { calculateCostComparison } from "../lib/cost";
import { evaluateCropSuitability } from "../lib/suitability";
import { CROPS_DATABASE } from "../data/crops";
import { SAMPLE_SOIL_CARDS } from "../data/samples";
import { SoilReport } from "../types";

describe("Soil Parameter Classification Rules", () => {
  it("classifies pH accurately according to Indian Soil Health Card standards", () => {
    expect(classifyPH(5.5).rating).toBe("ACIDIC");
    expect(classifyPH(7.0).rating).toBe("NEUTRAL");
    expect(classifyPH(8.0).rating).toBe("ALKALINE");
    expect(classifyPH(9.0).rating).toBe("STRONGLY_ALKALINE");
  });

  it("classifies EC (Electrical Conductivity) correctly", () => {
    expect(classifyEC(0.5).rating).toBe("SAFE");
    expect(classifyEC(1.5).rating).toBe("SLIGHTLY_SALINE");
    expect(classifyEC(2.8).rating).toBe("SALINE");
  });

  it("classifies Organic Carbon % correctly", () => {
    expect(classifyOrganicCarbon(0.3).rating).toBe("LOW");
    expect(classifyOrganicCarbon(0.6).rating).toBe("MEDIUM");
    expect(classifyOrganicCarbon(0.9).rating).toBe("HIGH");
  });

  it("classifies Primary Nutrients (N, P, K) correctly", () => {
    // Nitrogen: <280 Low, 280-560 Med, >560 High
    expect(classifyNitrogen(200).rating).toBe("LOW");
    expect(classifyNitrogen(350).rating).toBe("MEDIUM");
    expect(classifyNitrogen(600).rating).toBe("HIGH");

    // Phosphorus: <10 Low, 10-25 Med, >25 High
    expect(classifyPhosphorus(8).rating).toBe("LOW");
    expect(classifyPhosphorus(15).rating).toBe("MEDIUM");
    expect(classifyPhosphorus(32).rating).toBe("HIGH");

    // Potassium: <108 Low, 108-280 Med, >280 High
    expect(classifyPotassium(90).rating).toBe("LOW");
    expect(classifyPotassium(180).rating).toBe("MEDIUM");
    expect(classifyPotassium(310).rating).toBe("HIGH");
  });

  it("handles micronutrients and null/undefined values gracefully", () => {
    expect(classifyMicronutrient("zinc", 0.4).rating).toBe("DEFICIENT");
    expect(classifyMicronutrient("zinc", 0.9).rating).toBe("SUFFICIENT");
    expect(classifyMicronutrient("zinc", null).rating).toBe("NOT_TESTED");
    expect(classifyMicronutrient("iron", undefined).rating).toBe("NOT_TESTED");
  });

  it("calculates balanced soil health score between 0 and 100", () => {
    const sample = SAMPLE_SOIL_CARDS[0].report;
    const score = calculateSoilHealthScore(sample);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("Fertilizer Dose Logic & DAP/Urea N-Accounting", () => {
  const wheatCrop = CROPS_DATABASE.find((c) => c.id === "wheat")!;

  it("deducts Nitrogen supplied by DAP before sizing Urea", () => {
    // Normal medium soil
    const report: SoilReport = {
      id: "test-medium",
      fieldName: "Test Field",
      date: "2026-10-25",
      ph: 7.0,
      ec: 0.5,
      organicCarbon: 0.6,
      nitrogen: 350, // Medium -> 100% of base (120 kg/ha)
      phosphorus: 18, // Medium -> 100% of base (60 kg/ha P2O5)
      potassium: 200, // Medium -> 100% of base (40 kg/ha K2O)
    };

    // Calculate for 1 hectare to make direct calculation comparisons simple
    const plan = calculateFertilizerPlan(report, wheatCrop, 1.0, "hectare");

    // target P2O5 is 60 kg
    // DAP required = 60 / 0.46 = 130.43 -> ~130 kg
    expect(plan.dapKg).toBeGreaterThanOrEqual(129);
    expect(plan.dapKg).toBeLessThanOrEqual(132);

    // DAP supplied N = dapKg * 0.18 = 130 * 0.18 = ~23.4 kg N
    expect(plan.dapNSuppliedKg).toBeGreaterThanOrEqual(23);

    // Total N needed = 120 kg
    // Remaining N for Urea = 120 - 23.4 = 96.6 kg
    // Urea needed = 96.6 / 0.46 = 210 kg
    // If DAP N was ignored, urea would have been 120 / 0.46 = 260 kg (a 50 kg error!)
    expect(plan.ureaKg).toBeLessThan(230);
    expect(plan.ureaKg).toBeGreaterThanOrEqual(200);
  });

  it("skips DAP completely when soil Phosphorus is HIGH", () => {
    // Punjab sample has P = 36 kg/ha (> 25 kg/ha High)
    const punjabReport = SAMPLE_SOIL_CARDS[0].report;
    const plan = calculateFertilizerPlan(punjabReport, wheatCrop, 2.0, "acre");

    expect(plan.skipDap).toBe(true);
    expect(plan.dapKg).toBe(0);
    expect(plan.dapBags).toBe(0);
    expect(plan.doNotAddList.some((item) => item.product.includes("DAP"))).toBe(true);
  });

  it("recommends Lime for acidic soils and Gypsum for alkaline/saline soils", () => {
    const odishaReport = SAMPLE_SOIL_CARDS[1].report; // pH 5.2
    const riceCrop = CROPS_DATABASE.find((c) => c.id === "rice")!;
    const odishaPlan = calculateFertilizerPlan(odishaReport, riceCrop, 1.5, "acre");

    expect(odishaPlan.amendments.some((a) => a.product.includes("Lime"))).toBe(true);

    const mhReport = SAMPLE_SOIL_CARDS[2].report; // pH 8.3, EC 1.65
    const cottonCrop = CROPS_DATABASE.find((c) => c.id === "cotton")!;
    const mhPlan = calculateFertilizerPlan(mhReport, cottonCrop, 3.0, "acre");

    expect(mhPlan.amendments.some((a) => a.product.includes("Gypsum"))).toBe(true);
  });

  it("recommends Zinc Sulphate when Zinc is deficient", () => {
    const odishaReport = SAMPLE_SOIL_CARDS[1].report; // Zn 0.42 ppm (< 0.6)
    const riceCrop = CROPS_DATABASE.find((c) => c.id === "rice")!;
    const plan = calculateFertilizerPlan(odishaReport, riceCrop, 1.0, "acre");

    expect(plan.amendments.some((a) => a.product.includes("Zinc Sulphate"))).toBe(true);
  });
});

describe("Cost Savings Engine", () => {
  const wheatCrop = CROPS_DATABASE.find((c) => c.id === "wheat")!;

  it("computes significant savings when DAP is skipped for high phosphorus soil", () => {
    const punjabReport = SAMPLE_SOIL_CARDS[0].report;
    const plan = calculateFertilizerPlan(punjabReport, wheatCrop, 2.0, "acre");
    const cost = calculateCostComparison(plan);

    // Farmer would typically apply: 2 acres * 1 bag DAP = 2 bags DAP = ₹2,700
    // Recommended DAP = 0 bags -> Saving ₹2,700 on DAP!
    expect(cost.dapSavings).toBe(2700);
    expect(cost.typicalCost).toBeGreaterThan(cost.recommendedCost);
    expect(cost.totalSavings).toBeGreaterThan(0);
    expect(cost.savingsPerAcre).toBeGreaterThan(200);
  });
});

describe("Crop Suitability Ranking", () => {
  it("ranks wheat high for Rabi season with neutral/mild soil", () => {
    const punjabReport = SAMPLE_SOIL_CARDS[0].report;
    const ranked = evaluateCropSuitability(punjabReport, "Rabi");

    expect(ranked.length).toBe(CROPS_DATABASE.length);
    const topCrop = ranked[0];
    expect(topCrop.score).toBeGreaterThanOrEqual(70);
    expect(["wheat", "mustard", "chickpea", "potato"]).toContain(topCrop.crop.id);
  });
});
