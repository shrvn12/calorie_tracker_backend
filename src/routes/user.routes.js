// src/routes/user.routes.js
import { Router } from 'express';
import * as userCtrl from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/profile',   userCtrl.getProfile);
router.post('/profile',  validate(updateProfileSchema), userCtrl.updateProfile);
router.patch('/profile', validate(updateProfileSchema), userCtrl.updateProfile);

export default router;
