// src/routes/ai.routes.js
import { Router } from 'express';
import { getDashboard } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);

export default router;
