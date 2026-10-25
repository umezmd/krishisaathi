import { FertilizerDosePlan, CostComparison } from "@/types";
import {
  DEFAULT_FERTILIZER_PRICES,
  TYPICAL_FARMER_BASELINE_PER_ACRE,
  FertilizerPrices,
} from "@/data/prices";

/**
 * Calculates money saved by following scientific soil-test based recommendations
 * compared to traditional blanket fertilizer application (2 bags Urea + 1 bag DAP per acre).
 */
export function calculateCostComparison(
  plan: FertilizerDosePlan,
  customPrices?: Partial<FertilizerPrices>
): CostComparison {
  const prices: FertilizerPrices = {
    ...DEFAULT_FERTILIZER_PRICES,
    ...customPrices,
  };

  const areaInAcres = Math.max(0.1, plan.areaInAcres);

  // Typical blanket application for this area
  const typicalUreaBags = Math.round(TYPICAL_FARMER_BASELINE_PER_ACRE.ureaBags * areaInAcres * 10) / 10;
  const typicalDapBags = Math.round(TYPICAL_FARMER_BASELINE_PER_ACRE.dapBags * areaInAcres * 10) / 10;
  const typicalMopBags = 0;

  const typicalCost = Math.round(
    typicalUreaBags * prices.urea50kg + typicalDapBags * prices.dap50kg
  );

  // Recommended plan application
  const recommendedUreaBags = plan.ureaBags;
  const recommendedDapBags = plan.dapBags;
  const recommendedSspBags = plan.sspBags;
  const recommendedMopBags = plan.mopBags;

  const recommendedCost = Math.round(
    recommendedUreaBags * prices.urea50kg +
      recommendedDapBags * prices.dap50kg +
      recommendedMopBags * prices.mop50kg
  );

  const dapSavings = Math.round((typicalDapBags - recommendedDapBags) * prices.dap50kg);
  const ureaSavings = Math.round((typicalUreaBags - recommendedUreaBags) * prices.urea50kg);
  const totalSavings = typicalCost - recommendedCost;
  const savingsPerAcre = Math.round(totalSavings / areaInAcres);
  const savingsPercentage =
    typicalCost > 0 ? Math.round((totalSavings / typicalCost) * 100) : 0;

  return {
    typicalCost,
    recommendedCost,
    totalSavings,
    savingsPerAcre,
    savingsPercentage,
    dapSavings,
    ureaSavings,
    typicalBags: {
      ureaBags: typicalUreaBags,
      dapBags: typicalDapBags,
      mopBags: typicalMopBags,
    },
    recommendedBags: {
      ureaBags: recommendedUreaBags,
      dapBags: recommendedDapBags,
      sspBags: recommendedSspBags,
      mopBags: recommendedMopBags,
    },
    prices,
  };
}
