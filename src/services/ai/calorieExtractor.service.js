// src/services/ai/calorieExtractor.service.js
import genAI, { AI_MODEL } from '../../config/gemini.js';
import { CALORIE_EXTRACTION_SYSTEM_PROMPT, buildTextPrompt } from './prompts.js';
import { logger } from '../../utils/logger.js';

/**
 * Extract calorie + macro data from a text food description.
 * @param {string} description - User's text description of the meal
 * @returns {Promise<object>} Parsed nutrition object
 */
export const extractCaloriesFromText = async (description) => {
  logger.info({ description }, 'Extracting calories from text');

  // Call the modern SDK method from the default exported client instance
  const response = await genAI.models.generateContent({
    model: AI_MODEL,
    contents: buildTextPrompt(description),
    config: {
      systemInstruction: CALORIE_EXTRACTION_SYSTEM_PROMPT,
      temperature: 0.1, // Low temp for consistent structured output
      maxOutputTokens: 2048,
      // Forces Gemini to output pure JSON without markdown code fences
      responseMimeType: "application/json", 
    },
  });

  // Access text directly using the getter property (.text) instead of calling it as a function
  const rawText = response.text;
  logger.debug({ rawText }, 'AI text response');

  return parseAIResponse(rawText);
};

/**
 * Parse and validate raw AI JSON response
 * @param {string} raw
 * @returns {object}
 */
const parseAIResponse = (raw) => {
  try {
    const parsed = JSON.parse(raw);

    // Enforce required fields with safe defaults
    return {
      name:        parsed.name        || 'Unknown Food',
      description: parsed.description || null,
      mealType:    ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(parsed.mealType)
                     ? parsed.mealType : 'SNACK',
      calories:    Number(parsed.calories)  || 0,
      proteinG:    Number(parsed.proteinG)  || 0,
      carbsG:      Number(parsed.carbsG)    || 0,
      fatG:        Number(parsed.fatG)      || 0,
      fiberG:      Number(parsed.fiberG)    || 0,
      sugarG:      Number(parsed.sugarG)    || 0,
      sodiumMg:    Number(parsed.sodiumMg)  || 0,
      confidence:  parsed.confidence  || 'medium',
      notes:       parsed.notes       || null,
    };
  } catch (err) {
    logger.error({ raw, err: err.message }, 'Failed to parse AI nutrition response');
    throw new Error('AI returned an invalid response. Please try again.');
  }
};