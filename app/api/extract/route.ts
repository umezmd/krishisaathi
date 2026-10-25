import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SoilReport } from "@/types";
import { SAMPLE_SOIL_CARDS } from "@/data/samples";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, sampleId } = body;

    // Fast path: if the user explicitly picked a sample card or passed its sampleId
    if (sampleId) {
      const match = SAMPLE_SOIL_CARDS.find((s) => s.id === sampleId);
      if (match) {
        return NextResponse.json({
          report: match.report,
          isOfflineFallback: false,
          source: "sample_preset",
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      // Fallback gracefully to Sample 1 (Punjab Wheat) or a plausible card
      console.warn("No valid GEMINI_API_KEY found. Using robust offline fallback.");
      return NextResponse.json({
        report: SAMPLE_SOIL_CARDS[0].report,
        isOfflineFallback: true,
        source: "offline_fallback",
        message: "Offline mode active: Loaded standard Soil Health Card sample.",
      });
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image base64 data is required" },
        { status: 400 }
      );
    }

    // Prepare Gemini Vision extraction
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Strip data prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, "");

    const prompt = `You are an expert agricultural OCR system for Indian Soil Health Cards.
Extract the soil test results from the provided Soil Health Card image into this EXACT JSON structure.

JSON SCHEMA:
{
  "fieldName": string (or "My Farm Field"),
  "date": string (YYYY-MM-DD or today's date if missing),
  "ph": number (soil reaction, typically 4.0 - 9.5),
  "ec": number (electrical conductivity in dS/m or mmhos/cm, typically 0.1 - 4.0),
  "organicCarbon": number (OC in %, typically 0.1 - 1.5),
  "nitrogen": number (available N in kg/ha, typically 80 - 700),
  "phosphorus": number (available P or P2O5 in kg/ha, typically 5 - 80),
  "potassium": number (available K or K2O in kg/ha, typically 50 - 600),
  "sulphur": number or null (ppm),
  "zinc": number or null (ppm),
  "iron": number or null (ppm),
  "copper": number or null (ppm),
  "manganese": number or null (ppm),
  "boron": number or null (ppm)
}

Important Instructions:
- If a value is missing or unreadable, set it to null.
- Extract numbers only for the numeric fields.
- Recognize abbreviations like 'OC', 'Avail N', 'P2O5', 'K2O', 'Zn', 'Fe', 'S'.
- Output ONLY the valid JSON object.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const report: SoilReport = {
      id: `shc-scan-${Date.now()}`,
      fieldName: parsed.fieldName || "Scanned Field",
      date: parsed.date || new Date().toISOString().split("T")[0],
      ph: typeof parsed.ph === "number" ? parsed.ph : 7.2,
      ec: typeof parsed.ec === "number" ? parsed.ec : 0.5,
      organicCarbon: typeof parsed.organicCarbon === "number" ? parsed.organicCarbon : 0.5,
      nitrogen: typeof parsed.nitrogen === "number" ? parsed.nitrogen : 220,
      phosphorus: typeof parsed.phosphorus === "number" ? parsed.phosphorus : 28,
      potassium: typeof parsed.potassium === "number" ? parsed.potassium : 190,
      sulphur: typeof parsed.sulphur === "number" ? parsed.sulphur : null,
      zinc: typeof parsed.zinc === "number" ? parsed.zinc : null,
      iron: typeof parsed.iron === "number" ? parsed.iron : null,
      copper: typeof parsed.copper === "number" ? parsed.copper : null,
      manganese: typeof parsed.manganese === "number" ? parsed.manganese : null,
      boron: typeof parsed.boron === "number" ? parsed.boron : null,
    };

    return NextResponse.json({
      report,
      isOfflineFallback: false,
      source: "gemini_vision",
    });
  } catch (error) {
    console.error("Gemini Vision extraction failed, using fallback:", error);
    // Bulletproof fallback: Never crash the user experience
    return NextResponse.json({
      report: SAMPLE_SOIL_CARDS[0].report,
      isOfflineFallback: true,
      source: "offline_fallback",
      message: "AI extraction unavailable. Loaded Punjab Sample card for demonstration.",
    });
  }
}
