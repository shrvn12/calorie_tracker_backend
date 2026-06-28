// src/routes/meal.routes.js
import { Router } from 'express';
import * as mealCtrl from '../controllers/meal.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { textMealSchema, mealHistoryQuerySchema, updateMealSchema } from '../validators/meal.validator.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.post('/text',         validate(textMealSchema),          mealCtrl.logMealFromText);
router.post('/image',        upload.single('image'),            mealCtrl.logMealFromImage);
router.get('/today',                                            mealCtrl.getTodayMeals);
router.get('/history',       validateQuery(mealHistoryQuerySchema), mealCtrl.getMealHistory);
router.delete('/:mealId',                                      mealCtrl.deleteMeal);
router.patch('/:mealId',        validate(updateMealSchema),        mealCtrl.updateMeal);

export default router;
