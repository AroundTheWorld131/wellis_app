export type WeighIn = {
  date: Date;
  kg: number;
};

// Placeholder weigh-ins until weights are saved for real: weekly, 67.4 → 60 kg,
// ending today. Same story as the Home Weight card.
const KGS = [67.4, 66.9, 66.1, 65.8, 64.9, 64.2, 63.9, 63.0, 62.4, 61.6, 61.1, 60.4, 60.0];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const SAMPLE_WEIGH_INS: WeighIn[] = KGS.map((kg, index) => ({
  date: new Date(Date.now() - (KGS.length - 1 - index) * WEEK_MS),
  kg,
}));

export const SAMPLE_GOAL_KG = 60;
// BMI needs a height, which onboarding doesn't ask for yet.
export const SAMPLE_HEIGHT_CM = 175;
