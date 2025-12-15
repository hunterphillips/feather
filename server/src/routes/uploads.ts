import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createRequire } from 'module';
import type { Attachment } from '../types.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_BASE = path.join(__dirname, '../../data/uploads');

// Ensure uploads directory exists
await fs.mkdir(UPLOADS_BASE, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const chatId = req.body.chatId;

    // Require chatId - no temp uploads allowed
    if (!chatId || chatId === 'temp') {
      return cb(new Error('chatId is required'), '');
    }

    // Sanitize: only allow alphanumeric, hyphens, underscores
    if (!/^[a-zA-Z0-9_-]+$/.test(chatId)) {
      return cb(new Error('Invalid chat ID'), '');
    }

    const chatDir = path.join(UPLOADS_BASE, chatId);
    await fs.mkdir(chatDir, { recursive: true });
    cb(null, chatDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20_000_000, // 20MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/javascript',
      'application/javascript',
      'text/x-javascript',
      'application/x-javascript',
      'text/typescript',
      'application/x-typescript',
      'application/json',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`));
    }
  },
});

const router = Router();

// Upload single file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const chatId = req.body.chatId;

    if (!chatId) {
      res.status(400).json({ error: 'chatId is required' });
      return;
    }

    const relativePath = `${chatId}/${req.file.filename}`;

    // Extract text for documents if needed
    let extractedText: string | undefined;

    if (req.file.mimetype === 'application/pdf') {
      // Extract text from PDFs
      try {
        const dataBuffer = await fs.readFile(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text;
      } catch (error) {
        console.warn('PDF text extraction failed:', error);
        // Continue without extracted text
      }
    } else if (
      req.file.mimetype.startsWith('text/') ||
      req.file.mimetype.includes('javascript') ||
      req.file.mimetype.includes('typescript') ||
      req.file.mimetype === 'application/json' ||
      req.file.mimetype === 'application/xml'
    ) {
      // Extract text from all text-based files (text/*, code files, json, xml)
      try {
        extractedText = await fs.readFile(req.file.path, 'utf-8');
      } catch (error) {
        console.warn('Text extraction failed:', error);
      }
    }

    const attachment: Attachment = {
      id: crypto.randomUUID(),
      name: req.file.originalname,
      path: relativePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      createdAt: new Date().toISOString(),
      extractedText,
    };

    res.json(attachment);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Upload failed',
    });
  }
});

// Get file (serve uploaded files)
router.get('/:chatId/:filename', async (req, res) => {
  try {
    const filePath = path.join(
      UPLOADS_BASE,
      req.params.chatId,
      req.params.filename
    );

    // Security check: ensure path is within uploads directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(UPLOADS_BASE)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await fs.access(normalizedPath); // Check if file exists
    res.sendFile(normalizedPath);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
