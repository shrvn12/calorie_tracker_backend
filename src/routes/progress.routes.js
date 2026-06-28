// src/routes/progress.routes.js
import { Router } from 'express';
import * as progressCtrl from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { weightSchema } from '../validators/water.validator.js';

const router = Router();

router.use(authenticate);

router.post('/weight',         validate(weightSchema), progressCtrl.logWeight);
router.get('/weight/history',                         progressCtrl.getWeightHistory);
router.get('/calendar',                               progressCtrl.getCalendar);

export default router;
