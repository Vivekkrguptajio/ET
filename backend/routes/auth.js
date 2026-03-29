import { Router } from 'express';
import { generateToken, DEMO_USER } from '../middleware/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/login
 * Mock login — returns JWT token for demo user
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Demo mode: accept any credentials
  const user = {
    id: 1,
    name: req.body.name || 'Demo User',
    email: email || 'demo@et.finance',
  };

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email },
    message: 'Login successful (demo mode)',
  });
});

/**
 * GET /api/auth/me
 * Verify token and return current user
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
