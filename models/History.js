// models/History.js — Supabase-backed history helpers (replaces Mongoose schema)
import { supabase } from '../db.js';

export async function createHistory({ userId, sourceText, improvedEmail, diffHtml, selectedTone, improvements, clarityScore, toneResonance }) {
    const { data, error } = await supabase
        .from('history')
        .insert({
            user_id: userId,
            source_text: sourceText,
            improved_email: improvedEmail,
            diff_html: diffHtml || '',
            selected_tone: selectedTone,
            improvements: improvements || [],
            clarity_score: clarityScore || 0,
            tone_resonance: toneResonance || 0
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function getUserHistory(userId, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('history')
        .select('id, source_text, selected_tone, clarity_score, tone_resonance, created_at', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw error;
    return { entries: data, total: count };
}

export async function getHistoryById(id, userId) {
    const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
    if (error) return null;
    return data;
}

export async function countHistory() {
    const { count, error } = await supabase
        .from('history')
        .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
}
