import { CROPS_DATABASE } from "@/data/crops";
import { CropInfo, CropSuitability, Season, SoilReport } from "@/types";

/**
 * Evaluates crop suitability (0-100 score) for all crops based on soil test and season.
 * Returns the ranked list, allowing the UI to showcase the top 3 recommendations.
 */
export function evaluateCropSuitability(
  report: SoilReport,
  season: Season
): CropSuitability[] {
  const results: CropSuitability[] = CROPS_DATABASE.map((crop) => {
    let score = 0;
    const matchReasons: string[] = [];
    const riskWarnings: string[] = [];

    // 1. Season Fit (35 points)
    if (crop.seasons.includes(season)) {
      score += 35;
      matchReasons.push(`Natural fit for ${season} growing season.`);
    } else {
      score += 5;
      riskWarnings.push(`Usually grown in ${crop.seasons.join("/")}, not primary for ${season}.`);
    }

    // 2. pH Tolerance (30 points)
    const [minPh, maxPh] = crop.idealPhRange;
    if (report.ph >= minPh && report.ph <= maxPh) {
      score += 30;
      matchReasons.push(`Soil pH (${report.ph}) is in optimal range (${minPh}-${maxPh}).`);
    } else if (report.ph >= minPh - 0.5 && report.ph <= maxPh + 0.5) {
      score += 18;
      matchReasons.push(`Soil pH (${report.ph}) is moderately acceptable for ${crop.id}.`);
    } else {
      score += 5;
      riskWarnings.push(
        report.ph < minPh
          ? `Soil pH (${report.ph}) is too acidic (ideal: ${minPh}-${maxPh}).`
          : `Soil pH (${report.ph}) is too alkaline (ideal: ${minPh}-${maxPh}).`
      );
    }

    // 3. Salinity Tolerance (20 points)
    if (report.ec < 1.0) {
      score += 20;
      matchReasons.push("Electrical conductivity is safe for root development.");
    } else if (report.ec <= 2.0) {
      if (crop.salinityTolerance === "high") {
        score += 20;
        matchReasons.push("High salt tolerance makes it resilient to this soil's slight salinity.");
      } else if (crop.salinityTolerance === "medium") {
        score += 12;
        matchReasons.push("Moderate salt tolerance; maintain irrigation drainage.");
      } else {
        score += 5;
        riskWarnings.push("Sensitive to salinity; yield may be suppressed.");
      }
    } else {
      // EC > 2
      if (crop.salinityTolerance === "high") {
        score += 15;
        matchReasons.push("Salt-tolerant crop suitable for saline reclamation.");
      } else {
        score += 0;
        riskWarnings.push("High soil salinity poses severe risk to germination.");
      }
    }

    // 4. Nutrient Synergy & Biology (15 points)
    const isLegume =
      crop.id === "soybean" || crop.id === "groundnut" || crop.id === "chickpea";

    if (isLegume) {
      if (report.nitrogen < 280) {
        score += 15;
        matchReasons.push("Legume fixes atmospheric nitrogen; ideal for low-nitrogen soil.");
      } else {
        score += 12;
      }
    } else {
      if (report.nitrogen >= 280 && report.phosphorus >= 10) {
        score += 15;
        matchReasons.push("Soil fertility supports high nutrient demands of cereal/commercial crop.");
      } else {
        score += 8;
      }
    }

    const finalScore = Math.min(100, Math.max(10, score));

    return {
      crop,
      score: finalScore,
      matchReasons,
      riskWarnings,
      isRecommended: finalScore >= 70,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
