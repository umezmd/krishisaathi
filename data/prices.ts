/**
 * Fertilizer Price Configuration (Indian Rupees per 50 kg bag)
 * Subsidized statutory MRP and indicative market rates across Indian states.
 */

export interface FertilizerPrices {
  urea50kg: number;
  dap50kg: number;
  ssp50kg: number;
  mop50kg: number;
  zincSulphateKg: number;
  gypsumBag50kg: number;
  limeBag50kg: number;
}

export const DEFAULT_FERTILIZER_PRICES: FertilizerPrices = {
  urea50kg: 270, // Government controlled MRP for 45-50kg urea bag ~₹268
  dap50kg: 1350, // Subsidized DAP bag standard rate ~₹1350
  ssp50kg: 450, // Single Super Phosphate ~₹450-₹500
  mop50kg: 1700, // Muriate of Potash ~₹1700
  zincSulphateKg: 65, // ~₹65 per kg
  gypsumBag50kg: 180, // Agricultural gypsum bag ~₹180
  limeBag50kg: 200, // Agricultural lime bag ~₹200
};

/**
 * Baseline typical farmer practice (blanket application per acre):
 * 2 bags Urea (100 kg) + 1 bag DAP (50 kg) per acre regardless of soil testing
 */
export const TYPICAL_FARMER_BASELINE_PER_ACRE = {
  ureaBags: 2,
  dapBags: 1,
  mopBags: 0,
};
