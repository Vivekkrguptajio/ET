import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import taxRoutes from './routes/tax.js';
import healthRoutes from './routes/health.js';
import fireRoutes from './routes/fire.js';
import couplesRoutes from './routes/couples.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create uploads directory for PDF files
import { mkdirSync } from 'fs';
try { mkdirSync(join(__dirname, 'uploads'), { recursive: true }); } catch {}

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/fire', fireRoutes);
app.use('/api/couples', couplesRoutes);

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ET Finance API',
    version: '1.0.0',
    groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_here',
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handling ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────┐
  │   ET Finance API Server             │
  │   Running on http://localhost:${PORT}  │
  │                                     │
  │   Groq AI: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_your_groq_api_key_here' ? '✅ Configured' : '⚠️  Not configured'}          │
  │   Auth:    🔑 JWT (demo mode)       │
  │   Uploads: 📁 PDF support ready     │
  └─────────────────────────────────────┘
  `);
});

export default app;
