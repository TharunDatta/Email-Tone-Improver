import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

dotenv.config();

import handler from './api/enhance.js';
import { register, login, logout, me } from './api/auth.js';
import { saveHistory, getHistory, getHistoryDetail } from './api/history.js';
import { adminLogin, getUsers, getStats, getUserHistory, deleteHistoryEntry, deleteUser, getToneStats, resetUserPassword } from './api/admin.js';
import { authenticateToken, authenticateAdminToken, requireAdmin, apiLimiter, authLimiter, enhanceLimiter } from './api/middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Vercel proxy headers for accurate rate limiting and client IP
app.set('trust proxy', 1);

// Prevent crashes from unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('⚠️  Unhandled rejection:', err.message);
});

// ─── CORS Security ────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL && process.env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: FRONTEND_URL not set in production!');
    process.exit(1);
}

const ALLOWED_ORIGINS = [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests without origin (mobile apps, desktop apps)
        if (!origin) {
            return callback(null, true);
        }
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Not allowed by CORS policy: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(apiLimiter); // General rate limit on all requests

// ─── Auth Routes ──────────────────────────────────────
app.post('/api/auth/register', authLimiter, register);
app.post('/api/auth/login', authLimiter, login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', authenticateToken, me);

// ─── Enhance Route ────────────────────────────────────
app.post('/api/enhance', authenticateToken, enhanceLimiter, async (req, res) => {
    await handler(req, res);
});

// ─── History Routes ───────────────────────────────────
app.post('/api/history', authenticateToken, saveHistory);
app.get('/api/history', authenticateToken, getHistory);
app.get('/api/history/:id', authenticateToken, getHistoryDetail);

// ─── Admin Routes ─────────────────────────────────────
app.post('/api/admin/login', authLimiter, adminLogin);
app.get('/api/admin/users', authenticateAdminToken, requireAdmin, getUsers);
app.get('/api/admin/stats', authenticateAdminToken, requireAdmin, getStats);
app.get('/api/admin/user-history/:userId', authenticateAdminToken, requireAdmin, getUserHistory);
app.post('/api/admin/user/:userId/password', authenticateAdminToken, requireAdmin, resetUserPassword);
app.delete('/api/admin/history/:id', authenticateAdminToken, requireAdmin, deleteHistoryEntry);
app.delete('/api/admin/user/:userId', authenticateAdminToken, requireAdmin, deleteUser);
app.get('/api/admin/tone-stats', authenticateAdminToken, requireAdmin, getToneStats);

// ─── Serve HTML Pages ─────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/editor', (req, res) => res.sendFile(path.join(__dirname, 'editor.html')));
app.get('/how-it-works', (req, res) => res.sendFile(path.join(__dirname, 'how-it-works.html')));
app.get('/privacy-policy', (req, res) => res.sendFile(path.join(__dirname, 'privacy-policy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'terms.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));
app.get('/history-detail', (req, res) => res.sendFile(path.join(__dirname, 'history-detail.html')));
app.get('/admin-login', (req, res) => res.sendFile(path.join(__dirname, 'admin-login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Start Server locally (Vercel provides the serverless runtime)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Ethereal Tone running at http://localhost:${PORT}`);
        console.log(`📝 User Login: http://localhost:${PORT}/login`);
        console.log(`🛡️  Admin Login: http://localhost:${PORT}/admin-login\n`);
    });
}

export default app;
