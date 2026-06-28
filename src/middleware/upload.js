// src/middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { logger } from '../utils/logger.js';

// Ensure local temp upload dir exists
const UPLOAD_DIR = 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(12).toString('hex');
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a local file to Supabase Storage and delete the local temp file.
 * @param {string} localPath - Path to temp file on disk
 * @param {string} mimeType  - MIME type
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadToSupabase = async (localPath, mimeType) => {
  const bucket   = process.env.SUPABASE_STORAGE_BUCKET || 'meal-images';
  const filename = `${Date.now()}-${path.basename(localPath)}`;
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, fileBuffer, { contentType: mimeType, upsert: false });

  // Clean up temp file regardless of outcome
  fs.unlink(localPath, (err) => {
    if (err) logger.warn({ localPath }, 'Failed to delete temp upload file');
  });

  if (error) {
    logger.error({ error }, 'Supabase Storage upload error');
    throw new Error('Failed to upload image to storage');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
};
