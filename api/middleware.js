// api/middleware.js — JWT & Security middleware
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// CRITICAL: JWT_SECRET must be set and 32+ characters
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('❌ CRITICAL: JWT_SECRET environment variable not set!');
    process.exit(1);
}

if (JWT_SECRET.length < 32) {
    console.error('❌ CRITICAL: JWT_SECRET must be at least 32 characters!');
    process.exit(1);
}

// Generate JWT token
export function generateToken(userId, role = 'user') {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: '7d', algorithm: 'HS256' }
    );
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        return null;
    }
}

function getBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return null;
}

// Middleware to extract JWT from user cookies or Authorization header
export function authenticateToken(req, res, next) {
    try {
        // Try to get token from secure HTTP-only cookie first
        let token = req.cookies?.token;

        // Fallback to Authorization header (for development/testing)
        if (!token) {
            token = getBearerToken(req);
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed.' });
    }
}

// Middleware to extract JWT from admin cookies or Authorization header
export function authenticateAdminToken(req, res, next) {
    try {
        let token = req.cookies?.admin_token;

        if (!token) {
            token = getBearerToken(req);
        }

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Authentication failed.' });
    }
}

// Middleware for admin-only routes
export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

// Rate limiting: General API limit (100 requests per 15 min)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting: Auth endpoints (5 attempts per 15 min per IP)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: false,
    message: 'Too many login attempts, please try again later.',
});

// Rate limiting: Enhancement API (10 per 5 min - expensive Gemini calls)
export const enhanceLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Too many enhancement requests, please try again later.',
});
