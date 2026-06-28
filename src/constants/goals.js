// src/constants/goals.js

// Calorie adjustment relative to TDEE (in kcal/day)
export const GOAL_CALORIE_ADJUSTMENTS = {
  LOSE_WEIGHT:     -500, // ~0.5 kg/week deficit
  MAINTAIN_WEIGHT:    0,
  GAIN_WEIGHT:      300, // lean bulk surplus
  BUILD_MUSCLE:     200, // modest surplus with high protein
};

export const GOAL_LABELS = {
  LOSE_WEIGHT:     'Lose Weight',
  MAINTAIN_WEIGHT: 'Maintain Weight',
  GAIN_WEIGHT:     'Gain Weight',
  BUILD_MUSCLE:    'Build Muscle',
};
