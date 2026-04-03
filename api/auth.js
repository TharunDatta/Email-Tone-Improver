// api/auth.js — JWT-based auth handlers using Supabase User model
import { findUserByEmail, findUserById, createUser, verifyPassword } from '../models/User.js';
import { generateToken } from './middleware.js';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }
        if (password.length < 12) {
            return res.status(400).json({ error: 'Password must be at least 12 characters.' });
        }

        const existing = await findUserByEmail(email);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const user = await createUser(name, email, password);
        const token = generateToken(user.id, user.role);

        // Set secure HTTP-only cookie (expires in 7 days)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: 'Account created successfully.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error during registration.' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = generateToken(user.id, user.role);

        // Set secure HTTP-only cookie (expires in 7 days)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Login successful.',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error during login.' });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('token');
        res.clearCookie('admin_token');
        return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (err) {
        return res.status(500).json({ error: 'Could not log out.' });
    }
}

export async function me(req, res) {
    try {
        // JWT middleware already verified token and set req.user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const user = await findUserById(req.user.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error('Me endpoint error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
}
