// api/history.js — History handlers with validation & soft delete support
import { createHistory, getUserHistory, getHistoryById } from '../models/History.js';
import { incrementConversions } from '../models/User.js';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
    return typeof value === 'string' && uuidRegex.test(value);
}

export async function saveHistory(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts do not have personal history.' });
        }

        if (!isUuid(req.user.userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const { sourceText, improvedEmail, diffHtml, selectedTone, improvements, clarityScore, toneResonance } = req.body;

        // Validation
        if (!sourceText || !improvedEmail || !selectedTone) {
            return res.status(400).json({ error: 'Missing required fields: sourceText, improvedEmail, selectedTone.' });
        }

        // Trim and validate
        const trimmedSource = String(sourceText).trim();
        if (trimmedSource.length === 0 || trimmedSource.length > 10000) {
            return res.status(400).json({ error: 'Source text must be 1-10000 characters.' });
        }

        const entry = await createHistory({
            userId: req.user.userId,
            sourceText: trimmedSource,
            improvedEmail: String(improvedEmail).trim(),
            diffHtml: diffHtml ? String(diffHtml).trim() : '',
            selectedTone: String(selectedTone).trim(),
            improvements: Array.isArray(improvements) ? improvements : [],
            clarityScore: typeof clarityScore === 'number' ? Math.min(100, Math.max(0, clarityScore)) : 0,
            toneResonance: typeof toneResonance === 'number' ? Math.min(100, Math.max(0, toneResonance)) : 0
        });

        // Increment user's conversion count
        await incrementConversions(req.user.userId);

        return res.status(201).json({ message: 'History saved.', id: entry.id });
    } catch (err) {
        console.error('Save history error:', err);
        return res.status(500).json({ error: 'Failed to save history.' });
    }
}

export async function getHistory(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts do not have personal history.' });
        }

        if (!isUuid(req.user.userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Validate and sanitize pagination params
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

        const { entries, total } = await getUserHistory(req.user.userId, page, limit);
        const pages = Math.ceil(total / limit);

        return res.status(200).json({ entries, total, page, pages });
    } catch (err) {
        console.error('Get history error:', err);
        return res.status(500).json({ error: 'Failed to fetch history.' });
    }
}

export async function getHistoryDetail(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        if (req.user.role === 'admin') {
            return res.status(403).json({ error: 'Admin accounts do not have personal history.' });
        }

        if (!isUuid(req.user.userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        const { id } = req.params;
        if (!isUuid(id)) {
            return res.status(400).json({ error: 'Invalid history ID.' });
        }

        // Allow viewing soft-deleted records but mark them
        const entry = await getHistoryById(id, req.user.userId);
        if (!entry) {
            return res.status(404).json({ error: 'History entry not found.' });
        }

        // Flag if soft-deleted
        const isDeleted = entry.source_text === 'DELETED_BY_ADMIN';

        return res.status(200).json({ entry, isDeleted });
    } catch (err) {
        console.error('Get history detail error:', err);
        return res.status(500).json({ error: 'Failed to fetch history detail.' });
    }
}
