// src/services/ai/imageFoodDetector.service.js
import fs from 'fs';
import genAI, { AI_MODEL } from '../../config/gemini.js';
import { CALORIE_EXTRACTION_SYSTEM_PROMPT, buildImagePrompt } from './prompts.js';
import { logger } from '../../utils/logger.js';

/**
 * Extract calorie + macro data from a food image.
 * Accepts either a Buffer or a file path.
 * @param {Buffer|string} imageInput - Buffer or local path to uploaded image
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @returns {Promise<object>} Parsed nutrition object
 */
export const extractCaloriesFromImage = async (imageInput, mimeType = 'image/jpeg') => {
  logger.info({ imageInput }, 'Extracting calories from image');

  // Determine if imageInput is a Buffer or a file path
  const imageBuffer = Buffer.isBuffer(imageInput) ? imageInput : fs.readFileSync(imageInput);

  const base64Image = imageBuffer.toString('base64');

  // Call the modern generateContent method

  const nutritionSchema = {
    type: "OBJECT",
    properties: {
      name: { type: "STRING" },
      description: { type: "STRING" },
      mealType: { 
        type: "STRING", 
        enum: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] 
      },
      calories: { type: "INTEGER" },
      proteinG: { type: "INTEGER" },
      carbsG: { type: "INTEGER" },
      fatG: { type: "INTEGER" },
      fiberG: { type: "INTEGER" },
      sugarG: { type: "INTEGER" },
      sodiumMg: { type: "INTEGER" },
      confidence: { type: "STRING" },
      notes: { type: "STRING" }
    },
    required: ["name", "description", "mealType", "calories", "proteinG", "carbsG", "fatG"]
  };

  const response = await genAI.models.generateContent({
    model: AI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      buildImagePrompt(),
    ],
    config: {
      systemInstruction: CALORIE_EXTRACTION_SYSTEM_PROMPT,
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: nutritionSchema
    },
  });

  const rawText = response.text;
  logger.debug({ rawText }, 'AI image response');

  return parseAIImageResponse(rawText);
};

/**
 * Parse and validate raw AI JSON response
 * @param {string} raw
 * @returns {object}
 */
const parseAIImageResponse = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || 'Detected Food',
      description: parsed.description || null,
      mealType: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(parsed.mealType)
        ? parsed.mealType
        : 'SNACK',
      calories: Number(parsed.calories) || 0,
      proteinG: Number(parsed.proteinG) || 0,
      carbsG: Number(parsed.carbsG) || 0,
      fatG: Number(parsed.fatG) || 0,
      fiberG: Number(parsed.fiberG) || 0,
      sugarG: Number(parsed.sugarG) || 0,
      sodiumMg: Number(parsed.sodiumMg) || 0,
      confidence: parsed.confidence || 'medium',
      notes: parsed.notes || null,
    };
  } catch (err) {
    logger.error({ raw, err: err.message }, 'Failed to parse AI image nutrition response');
    throw new Error('AI could not analyze the image. Please try with a clearer food photo.');
  }
};