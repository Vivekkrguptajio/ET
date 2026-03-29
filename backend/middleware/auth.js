import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'et-demo-secret';
const DEMO_USER = { id: 1, name: 'Demo User', email: 'demo@et.finance' };

/**
 * Generate JWT token for a user
 */
export function generateToken(user = DEMO_USER) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Middleware: verify JWT token from Authorization header
 * Attaches decoded user to req.user
 * For demo: allows requests without token (sets req.user to DEMO_USER)
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Demo mode: allow without token
    req.user = DEMO_USER;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token expired or invalid — still allow in demo mode
    req.user = DEMO_USER;
    next();
  }
}

export { DEMO_USER };
