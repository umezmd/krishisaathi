import { SoilReport } from "@/types";

export interface SampleSoilCard {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  recommendedCropId: string;
  defaultAcres: number;
  season: "Kharif" | "Rabi" | "Zaid";
  imagePath: string;
  heroHighlight: string;
  keyFeature: string;
  report: SoilReport;
}

export const SAMPLE_SOIL_CARDS: SampleSoilCard[] = [
  {
    id: "punjab-wheat",
    name: "Sample 1: Punjab Wheat Field",
    subtitle: "High Phosphorus & Low Nitrogen (Alluvial)",
    region: "Ludhiana, Punjab",
    recommendedCropId: "wheat",
    defaultAcres: 2.0,
    season: "Rabi",
    imagePath: "/samples/sample-soil-card-punjab.svg",
    heroHighlight: "Save ₹2,700 by skipping unnecessary DAP!",
    keyFeature: "Excess Phosphorus detected -> DO NOT ADD DAP",
    report: {
      id: "shc-pb-2026-001",
      fieldName: "Green Field - Ludhiana",
      date: "2026-10-15",
      ph: 7.9,
      ec: 0.45,
      organicCarbon: 0.42,
      nitrogen: 190,
      phosphorus: 36.0,
      potassium: 210,
      sulphur: 14.0,
      zinc: 0.85,
      iron: 5.2,
      copper: 0.4,
      manganese: 1.8,
      boron: 0.65,
    },
  },
  {
    id: "odisha-rice",
    name: "Sample 2: Odisha Rice Field",
    subtitle: "Acidic & Zinc-Deficient (Coastal Laterite)",
    region: "Cuttack, Odisha",
    recommendedCropId: "rice",
    defaultAcres: 1.5,
    season: "Kharif",
    imagePath: "/samples/sample-soil-card-odisha.svg",
    heroHighlight: "Lime & Zinc recommendations prevent Khaira disease & boost yield!",
    keyFeature: "Acidic pH (5.2) + Zinc Deficient -> Needs Lime & Zinc Sulphate",
    report: {
      id: "shc-od-2026-042",
      fieldName: "Mahanadi Basin - Cuttack",
      date: "2026-10-10",
      ph: 5.2,
      ec: 0.32,
      organicCarbon: 0.38,
      nitrogen: 175,
      phosphorus: 8.5,
      potassium: 95,
      sulphur: 7.2,
      zinc: 0.42,
      iron: 8.5,
      copper: 0.35,
      manganese: 1.2,
      boron: 0.48,
    },
  },
  {
    id: "maharashtra-cotton",
    name: "Sample 3: Vidarbha Cotton Field",
    subtitle: "Saline-prone Black Soil & High Potash",
    region: "Akola, Maharashtra",
    recommendedCropId: "cotton",
    defaultAcres: 3.0,
    season: "Kharif",
    imagePath: "/samples/sample-soil-card-maharashtra.svg",
    heroHighlight: "Skip MOP Potash and apply Gypsum for soil reclamation!",
    keyFeature: "High Potassium (340 kg/ha) + Slightly Saline -> Skip MOP & Add Gypsum",
    report: {
      id: "shc-mh-2026-108",
      fieldName: "Black Cotton Soil - Akola",
      date: "2026-10-18",
      ph: 8.3,
      ec: 1.65,
      organicCarbon: 0.58,
      nitrogen: 240,
      phosphorus: 18.2,
      potassium: 340,
      sulphur: 12.0,
      zinc: 0.72,
      iron: 4.8,
      copper: 0.45,
      manganese: 1.5,
      boron: 0.32,
    },
  },
];
