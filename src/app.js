// src/app.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/apiResponse.js';

// Routes
import authRoutes     from './routes/auth.routes.js';
import userRoutes     from './routes/user.routes.js';
import mealRoutes     from './routes/meal.routes.js';
import waterRoutes    from './routes/water.routes.js';
import progressRoutes from './routes/progress.routes.js';
import aiRoutes       from './routes/ai.routes.js';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()),
  credentials: true,
}));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/auth',     authRoutes);
app.use('/users',    userRoutes);
app.use('/meals',    mealRoutes);
app.use('/water',    waterRoutes);
app.use('/',         progressRoutes);   // /weight, /calendar
app.use('/',         aiRoutes);         // /dashboard

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => sendError(res, { message: 'Route not found', statusCode: 404 }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
