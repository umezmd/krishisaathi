import { jsPDF } from "jspdf";
import { FullActionPlanResult } from "@/types";

/**
 * Generates and downloads a clean, printable A4 PDF Soil Action Plan report.
 */
export function generatePdfReport(result: FullActionPlanResult): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const greenDark = [46, 125, 50] as const;
  const brownDark = [109, 76, 65] as const;
  const grayLight = [245, 245, 245] as const;

  // Header Banner
  doc.setFillColor(...greenDark);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("KrishiSaathi - Soil Action Plan", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Scientific Soil Health to Fertilizer & Cost-Saving Advisory", 14, 19);
  doc.text("Govt. of India SHC Standards Compatible", 14, 24);

  // Report & Field Metadata Card
  doc.setFillColor(...grayLight);
  doc.roundedRect(14, 34, 182, 28, 2, 2, "F");

  doc.setTextColor(33, 33, 33);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Field: ${result.report.fieldName}`, 18, 41);
  doc.setFont("helvetica", "normal");
  doc.text(`Date of Test: ${result.report.date}`, 18, 47);
  doc.text(
    `Area: ${result.landArea} ${result.landUnit === "acre" ? "Acres" : "Hectares"} (${result.fertilizerPlan.areaInAcres} ac)`,
    18,
    53
  );

  doc.setFont("helvetica", "bold");
  doc.text(`Crop: ${result.crop.names.en}`, 110, 41);
  doc.setFont("helvetica", "normal");
  doc.text(`Season: ${result.season}`, 110, 47);
  doc.text(`Soil Health Score: ${result.assessment.score} / 100`, 110, 53);

  // Section 1: Soil Test Results
  doc.setTextColor(...brownDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Soil Test Analysis & Nutrient Ratings", 14, 69);

  // Table header
  doc.setFillColor(235, 235, 235);
  doc.rect(14, 73, 182, 7, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Parameter", 18, 78);
  doc.text("Value", 70, 78);
  doc.text("Unit", 95, 78);
  doc.text("Rating / Status", 125, 78);
  doc.text("ICAR Ideal", 165, 78);

  let currentY = 85;
  doc.setFont("helvetica", "normal");
  for (const p of result.assessment.parameters.slice(0, 6)) {
    doc.text(p.name, 18, currentY);
    doc.text(`${p.value ?? "N/A"}`, 70, currentY);
    doc.text(p.unit, 95, currentY);

    if (p.rating.includes("HIGH") || p.rating.includes("EXCESS")) {
      doc.setTextColor(211, 47, 47);
      doc.text(`${p.rating} (Skip!)`, 125, currentY);
    } else if (p.rating.includes("LOW") || p.rating.includes("DEFICIENT")) {
      doc.setTextColor(198, 40, 40);
      doc.text(p.rating, 125, currentY);
    } else {
      doc.setTextColor(46, 125, 50);
      doc.text(p.rating, 125, currentY);
    }

    doc.setTextColor(100, 100, 100);
    doc.text(p.benchmark, 165, currentY);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, currentY + 2, 196, currentY + 2);
    currentY += 7;
  }

  // Section 2: Fertilizer Dosage & Cost Savings
  currentY += 5;
  doc.setTextColor(...brownDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Recommended Commercial Fertilizer Dose", 14, currentY);

  currentY += 5;
  doc.setFillColor(235, 235, 235);
  doc.rect(14, currentY, 182, 7, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Fertilizer Product", 18, currentY + 5);
  doc.text("Total Quantity", 70, currentY + 5);
  doc.text("50 kg Bags", 110, currentY + 5);
  doc.text("Timing & Split", 145, currentY + 5);

  currentY += 12;
  const fertRows = [
    {
      name: "Urea (46% N)",
      qty: `${result.fertilizerPlan.ureaKg} kg`,
      bags: `${result.fertilizerPlan.ureaBags} bags`,
      split: "Basal + 21d + 45d",
    },
    {
      name: result.fertilizerPlan.skipDap ? "DAP (18-46-0) [SKIPPED]" : "DAP (18-46-0)",
      qty: result.fertilizerPlan.skipDap ? "0 kg" : `${result.fertilizerPlan.dapKg} kg`,
      bags: result.fertilizerPlan.skipDap ? "0 bags" : `${result.fertilizerPlan.dapBags} bags`,
      split: result.fertilizerPlan.skipDap ? "Soil High in P - Save ₹" : "100% Basal at sowing",
    },
    {
      name: result.fertilizerPlan.skipMop ? "MOP Potash (60% K2O) [SKIPPED]" : "MOP (60% K2O)",
      qty: result.fertilizerPlan.skipMop ? "0 kg" : `${result.fertilizerPlan.mopKg} kg`,
      bags: result.fertilizerPlan.skipMop ? "0 bags" : `${result.fertilizerPlan.mopBags} bags`,
      split: result.fertilizerPlan.skipMop ? "Soil High in K - Save ₹" : "100% Basal at sowing",
    },
  ];

  doc.setFont("helvetica", "normal");
  for (const f of fertRows) {
    doc.setTextColor(f.name.includes("SKIPPED") ? 211 : 40, 40, 40);
    doc.text(f.name, 18, currentY);
    doc.text(f.qty, 70, currentY);
    doc.text(f.bags, 110, currentY);
    doc.text(f.split, 145, currentY);

    doc.setDrawColor(230, 230, 230);
    doc.line(14, currentY + 2, 196, currentY + 2);
    currentY += 7;
  }

  // Cost Savings Highlight Box
  currentY += 4;
  doc.setFillColor(232, 245, 233);
  doc.setDrawColor(76, 175, 80);
  doc.roundedRect(14, currentY, 182, 22, 2, 2, "FD");

  doc.setTextColor(27, 94, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total Money Saved: ₹${result.costComparison.totalSavings.toLocaleString("en-IN")}`, 18, currentY + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Typical blanket practice: ₹${result.costComparison.typicalCost.toLocaleString("en-IN")} vs Scientific Soil Plan: ₹${result.costComparison.recommendedCost.toLocaleString("en-IN")}`,
    18,
    currentY + 14
  );
  doc.text(
    `You save ₹${result.costComparison.savingsPerAcre.toLocaleString("en-IN")} per acre while improving long-term soil productivity.`,
    18,
    currentY + 19
  );

  // Section 3: Do Not Add / Amendments
  currentY += 28;
  if (result.fertilizerPlan.doNotAddList.length > 0) {
    doc.setFillColor(255, 235, 238);
    doc.roundedRect(14, currentY, 182, 18, 2, 2, "F");
    doc.setTextColor(198, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DO NOT ADD - Critical Fertilizer Warning:", 18, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const alertText = result.fertilizerPlan.doNotAddList
      .map((d) => `• ${d.product}: ${d.reason}`)
      .join(" ");
    doc.text(doc.splitTextToSize(alertText, 174), 18, currentY + 11);
    currentY += 22;
  }

  // Amendments
  if (result.fertilizerPlan.amendments.length > 0) {
    doc.setTextColor(...brownDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Soil Amendments Required:", 14, currentY);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    for (const a of result.fertilizerPlan.amendments) {
      doc.text(`• ${a.product} (${a.amountUnit}): ${a.timing}`, 18, currentY);
      currentY += 4.5;
    }
  }

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.line(14, 278, 196, 278);
  doc.text(
    "Disclaimer: Advice is indicative based on soil test parameters. Confirm with your local Agriculture Officer or KVK.",
    14,
    283
  );
  doc.text(
    `Generated by KrishiSaathi (Soil Report to Action Plan) on ${new Date().toLocaleDateString("en-IN")}`,
    14,
    287
  );

  // Save PDF
  const safeName = (result.report.fieldName || "Soil_Report").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`KrishiSaathi_${safeName}.pdf`);
}
