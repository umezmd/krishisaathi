import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FertilizerDosePlan, LanguageCode, SoilHealthAssessment, WeatherAdvisory } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Deterministic template explanation generator in all 6 languages
 * used when offline, when API key is missing, or when API call fails.
 */
function generateTemplateExplanation(
  plan: FertilizerDosePlan,
  assessment: SoilHealthAssessment,
  lang: LanguageCode,
  weather?: WeatherAdvisory
): string[] {
  const isEn = lang === "en";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";
  const isMr = lang === "mr";
  const isKn = lang === "kn";

  const steps: string[] = [];

  // Step 1: Basal / DAP advice
  if (plan.skipDap) {
    if (isHi) steps.push("1. डीएपी (DAP) बिल्कुल न खरीदें। आपकी मिट्टी में पहले से बहुत फास्फोरस है।");
    else if (isTe) steps.push("1. మీ నేలలో భాస్వరం అధికంగా ఉంది. DAP అసలు కొనకండి, డబ్బు ఆదా చేసుకోండి.");
    else if (isTa) steps.push("1. உங்கள் மண்ணில் பாஸ்பரஸ் அதிகம் உள்ளது. DAP வாங்க வேண்டாம், பணத்தை மிச்சப்படுத்துங்கள்.");
    else if (isMr) steps.push("1. डीएपी (DAP) विकत घेऊ नका. आपल्या जमिनीत आधीच भरपूर स्फुरद आहे.");
    else if (isKn) steps.push("1. ನಿಮ್ಮ ಮಣ್ಣಿನಲ್ಲಿ ರಂಜಕ ಹೆಚ್ಚಾಗಿದೆ. DAP ಕೊಳ್ಳಬೇಡಿ, ಹಣ ಉಳಿಸಿ.");
    else steps.push("1. Do not buy DAP. Your soil already has plenty of phosphorus.");
  } else if (plan.dapBags > 0) {
    if (isHi) steps.push(`1. बुवाई के समय खेत में ${plan.dapBags} बोरी डीएपी (DAP) नीचे डालें।`);
    else if (isTe) steps.push(`1. విత్తే సమయంలో ${plan.dapBags} బస్తాల DAP ని నేలలో వేయండి.`);
    else if (isTa) steps.push(`1. விதைக்கும் போது நிலத்தில் ${plan.dapBags} மூட்டை DAP இடவும்.`);
    else if (isMr) steps.push(`1. पेरणीच्या वेळी शेतात ${plan.dapBags} गोणी डीएपी (DAP) टाका.`);
    else if (isKn) steps.push(`1. ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ${plan.dapBags} ಚೀಲ DAP ಗೊಬ್ಬರ ಹಾಕಿ.`);
    else steps.push(`1. Apply ${plan.dapBags} bags of DAP at sowing time.`);
  }

  // Step 2: Urea Schedule
  if (plan.ureaBags > 0) {
    if (isHi) steps.push(`2. यूरिया की कुल ${plan.ureaBags} बोरी लें। इसे एक साथ नहीं, तीन किस्तों में डालें।`);
    else if (isTe) steps.push(`2. మొత్తం ${plan.ureaBags} బస్తాల యూరియాను మూడు విడతలుగా మాత్రమే వేయండి.`);
    else if (isTa) steps.push(`2. மொத்தம் ${plan.ureaBags} மூட்டை யூரியாவை மூன்று தவணைகளாகப் பிரித்து இடவும்.`);
    else if (isMr) steps.push(`2. युरियाच्या एकूण ${plan.ureaBags} गोण्या तीन हप्त्यांमध्ये विभागून द्या.`);
    else if (isKn) steps.push(`2. ಒಟ್ಟು ${plan.ureaBags} ಚೀಲ ಯೂರಿಯಾವನ್ನು ಮೂರು ಕಂತುಗಳಲ್ಲಿ ಹಂಚಿ ಹಾಕಿ.`);
    else steps.push(`2. Use ${plan.ureaBags} bags of Urea, divided into three split doses.`);
  }

  // Step 3: Day 21 top-dressing
  if (isHi) steps.push("3. बुवाई के 21 दिन बाद निराई-गुड़ाई करके यूरिया की दूसरी खुराक दें।");
  else if (isTe) steps.push("3. విత్తిన 21 రోజుల తర్వాత కలుపు తీసి యూరియా రెండవ విడత వేయండి.");
  else if (isTa) steps.push("3. விதைத்த 21 நாட்களுக்குப் பின் களை எடுத்து இரண்டாவது யூரியா இடவும்.");
  else if (isMr) steps.push("3. पेरणीनंतर 21 दिवसांनी खुरपणी करून युरियाचा दुसरा हप्ता द्या.");
  else if (isKn) steps.push("3. ಬಿತ್ತಿದ 21 ದಿನಗಳ ನಂತರ ಕಳೆ ತೆಗೆದು ಎರಡನೇ ಕಂತಿನ ಯೂರಿಯಾ ಹಾಕಿ.");
  else steps.push("3. Apply the second urea dose at 21 days after weeding.");

  // Step 4: Amendments if any
  if (plan.amendments.length > 0) {
    const firstAmendment = plan.amendments[0];
    if (isHi) steps.push(`4. मिट्टी सुधार: खेत में ${firstAmendment.product} (${firstAmendment.amountUnit}) अवश्य डालें।`);
    else if (isTe) steps.push(`4. నేల బలానికి: ${firstAmendment.product} (${firstAmendment.amountUnit}) తప్పక చల్లండి.`);
    else if (isTa) steps.push(`4. மண் சீர்திருத்தம்: ${firstAmendment.product} (${firstAmendment.amountUnit}) கட்டாயம் இடவும்.`);
    else if (isMr) steps.push(`4. जमीन सुधारणा: शेतात ${firstAmendment.product} (${firstAmendment.amountUnit}) अवश्य वापरा.`);
    else if (isKn) steps.push(`4. ಮಣ್ಣು ಸುಧಾರಣೆ: ${firstAmendment.product} (${firstAmendment.amountUnit}) ಖಂಡಿತವಾಗಿ ಹಾಕಿ.`);
    else steps.push(`4. Soil amendment: Apply ${firstAmendment.product} (${firstAmendment.amountUnit}) as advised.`);
  }

  // Step 5: Weather alert integration
  if (weather?.hasHeavyRainWarning) {
    if (isHi) steps.push("5. मौसम चेतावनी: 3 दिनों में बारिश होगी। यूरिया डालने में देरी करें।");
    else if (isTe) steps.push("5. వాతావరణ హెచ్చరిక: రాబోయే 3 రోజుల్లో వర్షం ఉంది, యూరియా వేయడం ఆపండి.");
    else if (isTa) steps.push("5. வானிலை எச்சரிக்கை: அடுத்த 3 நாட்களில் மழை வரும், யூரியா இடுவதை தள்ளிப்போடுங்கள்.");
    else if (isMr) steps.push("5. हवामान इशारा: 3 दिवसांत पाऊस पडेल. युरिया देणे पुढे ढकला.");
    else if (isKn) steps.push("5. ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: 3 ದಿನಗಳಲ್ಲಿ ಮಳೆ ಬರುತ್ತದೆ, ಯೂರಿಯಾ ಹಾಕುವುದನ್ನು ಮುಂದೂಡಿ.");
    else steps.push("5. Weather warning: Rain coming in 3 days. Delay urea to prevent wash off.");
  } else {
    if (isHi) steps.push("5. खाद हमेशा नमी वाले खेत में डालें और हल्की सिंचाई करें।");
    else if (isTe) steps.push("5. ఎరువులు ఎల్లప్పుడూ తేమ ఉన్న నేలలో వేసి తేలికపాటి తడి ఇవ్వండి.");
    else if (isTa) steps.push("5. உரத்தை எப்போதும் ஈரப்பதமான நிலத்தில் இட்டு லேசான பாசனம் செய்யவும்.");
    else if (isMr) steps.push("5. खत नेहमी जमिनीत ओल असतानाच द्या आणि हलके पाणी द्या.");
    else if (isKn) steps.push("5. ಗೊಬ್ಬರವನ್ನು ಯಾವಾಗಲೂ ತೇವಾಂಶವಿರುವ ಜಮೀನಿನಲ್ಲಿ ಹಾಕಿ ಹಗುರ ನೀರು ಹಾಯಿಸಿ.");
    else steps.push("5. Always apply fertilizer in moist soil followed by light irrigation.");
  }

  return steps;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, assessment, lang, cropName, weather } = body;
    const selectedLang: LanguageCode = lang || "en";

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      const templateSteps = generateTemplateExplanation(plan, assessment, selectedLang, weather);
      return NextResponse.json({
        steps: templateSteps,
        explanationText: templateSteps.join(" "),
        isOfflineFallback: true,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const langNames: Record<LanguageCode, string> = {
      en: "English",
      hi: "Hindi (हिन्दी)",
      te: "Telugu (తెలుగు)",
      ta: "Tamil (தமிழ்)",
      mr: "Marathi (मराठी)",
      kn: "Kannada (ಕನ್ನಡ)",
    };

    const targetLangName = langNames[selectedLang] || "English";

    const prompt = `You are KrishiSaathi, a caring, practical Indian agricultural expert talking directly to a smallholder farmer in ${targetLangName}.
Translate and explain this exact fertilizer plan into plain language.

STRICT CONSTRAINTS:
1. Output exactly 4 to 6 numbered steps.
2. Each step must be UNDER 20 words.
3. 5th-grade reading level, warm, practical, completely jargon-free.
4. Output MUST be written purely and natively in ${targetLangName}.
5. You must NEVER invent or alter numbers. All numbers (kg, bags) come strictly from the data below.
${plan.skipDap ? "- CRITICAL: Remind them NOT to buy DAP because their soil phosphorus is already high." : ""}
${weather?.hasHeavyRainWarning ? "- CRITICAL: Warn them to delay Urea application because rain is forecast in 3 days." : ""}

INPUT PLAN DATA:
Crop: ${cropName || "Crop"}
Field Area: ${plan.areaInAcres} Acres
Total Urea: ${plan.ureaKg} kg (${plan.ureaBags} bags of 50kg)
Total DAP: ${plan.dapKg} kg (${plan.dapBags} bags of 50kg) - Skip DAP: ${plan.skipDap}
Total MOP: ${plan.mopKg} kg (${plan.mopBags} bags of 50kg) - Skip MOP: ${plan.skipMop}
Soil Amendments: ${JSON.stringify(plan.amendments || [])}
Weather Alert: ${weather?.hasHeavyRainWarning ? "Heavy rain forecast in 3 days" : "Normal weather"}

Return ONLY the numbered steps, one per line.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const steps = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && /^\d+[\.\)]/.test(s));

    if (steps.length === 0) {
      const fallback = generateTemplateExplanation(plan, assessment, selectedLang, weather);
      return NextResponse.json({
        steps: fallback,
        explanationText: fallback.join(" "),
        isOfflineFallback: true,
      });
    }

    return NextResponse.json({
      steps,
      explanationText: steps.join(" "),
      isOfflineFallback: false,
    });
  } catch (error) {
    console.error("Gemini explain failed, falling back to local template:", error);
    const body = await req.json().catch(() => ({}));
    const fallback = generateTemplateExplanation(
      body.plan || { skipDap: true, dapBags: 0, ureaBags: 3, amendments: [] },
      body.assessment || { score: 75 },
      body.lang || "en",
      body.weather
    );
    return NextResponse.json({
      steps: fallback,
      explanationText: fallback.join(" "),
      isOfflineFallback: true,
    });
  }
}
