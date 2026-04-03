// api/admin.js — Admin handlers with soft delete & security fixes
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getAllUsers, countUsers, decrementConversions } from '../models/User.js';
import { countHistory } from '../models/History.js';
import { supabase } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
}

// Admin login (generates JWT with admin role)
export async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
            return res.status(500).json({ error: 'Admin credentials not configured.' });
        }

        if (email !== ADMIN_EMAIL) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        // Use bcrypt to compare password with hash (NOT plain text comparison)
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const token = jwt.sign(
            { userId: 'admin', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '7d', algorithm: 'HS256' }
        );

        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ message: 'Admin login successful.' });
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Admin login error:', err);
        }
        return res.status(500).json({ error: 'Server error.' });
    }
}

// Get all users
export async function getUsers(req, res) {
    try {
        const users = await getAllUsers();
        const totalConversions = users.reduce((sum, u) => sum + (u.total_conversions || 0), 0);
        return res.status(200).json({ users, total: users.length, totalConversions });
    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ error: 'Failed to fetch users.' });
    }
}

// Get system stats
export async function getStats(req, res) {
    try {
        const [totalUsers, totalConversions] = await Promise.all([countUsers(), countHistory()]);
        return res.status(200).json({ totalUsers, totalConversions });
    } catch (err) {
        console.error('Get stats error:', err);
        return res.status(500).json({ error: 'Failed to fetch stats.' });
    }
}

// Get user's conversion history (includes soft-deleted records)
export async function getUserHistory(req, res) {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const { data, error } = await supabase
            .from('history')
            .select('id, source_text, improved_email, selected_tone, clarity_score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json({ history: data || [] });
    } catch (err) {
        console.error('Get user history error:', err);
        return res.status(500).json({ error: 'Failed to fetch user history.' });
    }
}

// Delete history entry (SOFT DELETE — update record instead of deleting)
export async function deleteHistoryEntry(req, res) {
    try {
        const { id } = req.params;

        // Validate historyId
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid history entry ID.' });
        }

        // Get the entry atomically in a transaction-like manner
        const { data: entry, error: fetchError } = await supabase
            .from('history')
            .select('user_id, source_text')
            .eq('id', id)
            .single();

        if (fetchError || !entry) {
            return res.status(404).json({ error: 'History entry not found.' });
        }

        // Check if already soft-deleted
        if (entry.source_text === 'DELETED_BY_ADMIN') {
            return res.status(400).json({ message: 'Entry already deleted.' });
        }

        // Perform SOFT DELETE: update instead of delete
        const { error: updateError } = await supabase
            .from('history')
            .update({
                source_text: 'DELETED_BY_ADMIN',
                improved_email: '',
                diff_html: '',
                improvements: []
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Decrement user's total_conversions atomically
        if (entry.user_id) {
            await decrementConversions(entry.user_id);
        }

        return res.status(200).json({
            message: 'History entry deleted.',
            userId: entry.user_id,
            deletedId: id
        });
    } catch (err) {
        console.error('Delete history error:', err);
        return res.status(500).json({ error: 'Failed to delete history entry.' });
    }
}

// Delete entire user & cascade their history
export async function deleteUser(req, res) {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Get count of history records to return
        const { count: historyCount } = await supabase
            .from('history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Delete all history first
        const { error: historyError } = await supabase
            .from('history')
            .delete()
            .eq('user_id', userId);

        if (historyError) throw historyError;

        // Then delete the user
        const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (userError) throw userError;

        return res.status(200).json({
            message: 'User and their history deleted.',
            deletedHistoryCount: historyCount || 0
        });
    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ error: 'Failed to delete user.' });
    }
}

// Get tone statistics (excludes soft-deleted records)
export async function getToneStats(req, res) {
    try {
        const { data, error } = await supabase
            .from('history')
            .select('selected_tone')
            .neq('source_text', 'DELETED_BY_ADMIN'); // Exclude soft-deleted

        if (error) throw error;

        const counts = {};
        (data || []).forEach(r => {
            const t = r.selected_tone || 'Unknown';
            counts[t] = (counts[t] || 0) + 1;
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const tones = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([tone, count]) => ({ tone, count, pct: total ? Math.round((count / total) * 100) : 0 }));

        return res.status(200).json({ tones, total });
    } catch (err) {
        console.error('Get tone stats error:', err);
        return res.status(500).json({ error: 'Failed to fetch tone stats.' });
    }
}


