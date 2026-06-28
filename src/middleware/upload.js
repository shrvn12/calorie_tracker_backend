// src/middleware/upload.js
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

import supabase from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

/**
 * Upload an in-memory file to Supabase Storage.
 *
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
export const uploadToSupabase = async (
  buffer,
  originalName,
  mimeType
) => {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'meal-images';

  const filename = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${path.extname(originalName)}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    logger.error({ error }, 'Supabase Storage upload error');
    throw new Error('Failed to upload image to storage');
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return data.publicUrl;
};