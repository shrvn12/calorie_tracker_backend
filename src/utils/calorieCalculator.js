// src/utils/calorieCalculator.js
import { ACTIVITY_MULTIPLIERS } from '../constants/activityLevels.js';
import { GOAL_CALORIE_ADJUSTMENTS } from '../constants/goals.js';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * @param {{ gender: string, weightKg: number, heightCm: number, age: number }} params
 * @returns {number} BMR in kcal/day
 */
export const calculateBMR = ({ gender, weightKg, heightCm, age }) => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'MALE' ? base + 5 : base - 161;
};

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number} TDEE in kcal/day
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate recommended daily calorie goal based on TDEE and user goal
 * @param {number} tdee
 * @param {string} goal
 * @returns {number} calorie target
 */
export const calculateCalorieGoal = (tdee, goal) => {
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[goal] ?? 0;
  return Math.max(1200, Math.round(tdee + adjustment));
};

/**
 * Calculate macronutrient targets (in grams) from calorie goal
 * @param {number} calorieGoal
 * @param {string} goal
 * @returns {{ proteinG: number, carbsG: number, fatG: number }}
 */
export const calculateMacroTargets = (calorieGoal, goal) => {
  // Protein: 30%, Carbs: 40%, Fat: 30% — adjusted slightly for muscle gain
  const proteinRatio = goal === 'BUILD_MUSCLE' ? 0.35 : 0.30;
  const carbRatio    = goal === 'BUILD_MUSCLE' ? 0.40 : 0.40;
  const fatRatio     = 1 - proteinRatio - carbRatio;

  return {
    proteinG: Math.round((calorieGoal * proteinRatio) / 4),
    carbsG:   Math.round((calorieGoal * carbRatio)    / 4),
    fatG:     Math.round((calorieGoal * fatRatio)     / 9),
  };
};
