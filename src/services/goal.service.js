// src/services/goal.service.js
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacroTargets } from '../utils/calorieCalculator.js';

/**
 * Compute all goal-related targets for a user profile.
 * Returns null if the profile is incomplete.
 * @param {object} profile - User fields
 * @returns {object|null}
 */
export const computeGoalTargets = (profile) => {
  const { gender, currentWeightKg, heightCm, age, activityLevel, goal } = profile;

  if (!gender || !currentWeightKg || !heightCm || !age || !activityLevel || !goal) {
    return null;
  }

  const bmr          = calculateBMR({ gender, weightKg: currentWeightKg, heightCm, age });
  const tdee         = calculateTDEE(bmr, activityLevel);
  const calorieGoal  = calculateCalorieGoal(tdee, goal);
  const macros       = calculateMacroTargets(calorieGoal, goal);

  return { bmr, tdee, calorieGoal, ...macros };
};
