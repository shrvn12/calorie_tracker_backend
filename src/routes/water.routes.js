// src/routes/water.routes.js
import { Router } from 'express';
import * as waterCtrl from '../controllers/water.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { logWaterSchema } from '../validators/water.validator.js';

const router = Router();

router.use(authenticate);

router.post('/',       validate(logWaterSchema), waterCtrl.logWater);
router.get('/today',                             waterCtrl.getTodayWater);
router.delete('/:waterId',                        waterCtrl.deleteWater);

export default router;
