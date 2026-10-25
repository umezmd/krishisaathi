import { WeatherAdvisory } from "@/types";

export interface CityCoords {
  name: string;
  lat: number;
  lon: number;
  state: string;
}

export const POPULAR_AGRI_CITIES: CityCoords[] = [
  { name: "Ludhiana", lat: 30.901, lon: 75.8573, state: "Punjab" },
  { name: "Cuttack", lat: 20.4625, lon: 85.883, state: "Odisha" },
  { name: "Akola", lat: 20.7002, lon: 77.0082, state: "Maharashtra" },
  { name: "Karnal", lat: 29.6857, lon: 76.9905, state: "Haryana" },
  { name: "Indore", lat: 22.7196, lon: 75.8577, state: "Madhya Pradesh" },
  { name: "Guntur", lat: 16.3067, lon: 80.4365, state: "Andhra Pradesh" },
  { name: "Thanjavur", lat: 10.787, lon: 79.1378, state: "Tamil Nadu" },
  { name: "Dharwad", lat: 15.4589, lon: 75.0078, state: "Karnataka" },
];

/**
 * Fetches 7-day forecast from Open-Meteo free API (no key required)
 */
export async function fetchWeatherForecast(
  lat: number = 30.901,
  lon: number = 75.8573,
  cityName: string = "Local Field"
): Promise<WeatherAdvisory> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Open-Meteo response status: ${res.status}`);
    }

    const data = await res.json();
    const dailyRain: number[] = data.daily?.precipitation_sum || [0, 0, 0];
    const dailyMaxTemp: number[] = data.daily?.temperature_2m_max || [30, 31, 30];

    // Sum rainfall for the next 3 days
    const rainNext3Days = Number(
      ((dailyRain[0] || 0) + (dailyRain[1] || 0) + (dailyRain[2] || 0)).toFixed(1)
    );
    const avgMaxTemp = Math.round(
      ((dailyMaxTemp[0] || 30) + (dailyMaxTemp[1] || 30)) / 2
    );

    const hasHeavyRainWarning = rainNext3Days >= 12.0; // 12mm+ rain washes surface urea
    const hasHeatWarning = avgMaxTemp >= 37.0 && rainNext3Days < 2.0;

    let condition = "Clear & Favorable";
    let advisoryText =
      "Weather is suitable for field fertilizer application and regular intercultural operations.";

    if (hasHeavyRainWarning) {
      condition = "Rain / Thunderstorm Forecast";
      advisoryText = `Rain (${rainNext3Days} mm) expected within 3 days. DELAY UREA application. Water runoff will leach nitrogen into drains.`;
    } else if (hasHeatWarning) {
      condition = "Dry & Hot";
      advisoryText = `High daytime heat (${avgMaxTemp}°C). Apply fertilizer early morning or evening and irrigate promptly to prevent ammonia volatilization.`;
    }

    return {
      city: cityName,
      temp: avgMaxTemp,
      condition,
      rainNext3DaysMm: rainNext3Days,
      hasHeavyRainWarning,
      hasHeatWarning,
      advisoryText,
    };
  } catch {
    // Graceful offline fallback
    return {
      city: cityName,
      temp: 31,
      condition: "Clear (Offline Forecast)",
      rainNext3DaysMm: 0,
      hasHeavyRainWarning: false,
      hasHeatWarning: false,
      advisoryText:
        "Favorable weather conditions. Apply fertilizer in moist soil during early morning or late afternoon.",
    };
  }
}
