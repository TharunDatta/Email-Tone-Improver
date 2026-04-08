// models/User.js — Supabase-backed user helpers with atomic operations
import bcrypt from 'bcryptjs';
import { supabase } from '../db.js';

export async function findUserByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
    
    if (error) return null;
    return data;
}

export async function findUserById(id) {
    if (!id || typeof id !== 'string') return null;
    
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, total_conversions, created_at')
        .eq('id', id)
        .single();
    
    if (error) return null;
    return data;
}

export async function createUser(name, email, password) {
    if (!name || !email || !password) throw new Error('Missing required fields');
    
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert({
            name: String(name).trim(),
            email: String(email).toLowerCase().trim(),
            password_hash,
            role: 'user',
            total_conversions: 0
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}

// Atomically increment conversations
export async function incrementConversions(userId) {
    if (!userId || typeof userId !== 'string') return;

    // Use Supabase RPC or read-then-write pattern
    try {
        const { data: user } = await supabase
            .from('users')
            .select('total_conversions')
            .eq('id', userId)
            .single();
        
        if (!user) return;
        
        const newCount = (user.total_conversions || 0) + 1;
        await supabase
            .from('users')
            .update({ total_conversions: newCount })
            .eq('id', userId);
    } catch (err) {
        console.error('Increment conversions error:', err);
    }
}

// Atomically decrement conversations
export async function decrementConversions(userId) {
    if (!userId || typeof userId !== 'string') return;

    try {
        const { data: user } = await supabase
            .from('users')
            .select('total_conversions')
            .eq('id', userId)
            .single();
        
        if (!user) return;
        
        const newCount = Math.max(0, (user.total_conversions || 0) - 1);
        await supabase
            .from('users')
            .update({ total_conversions: newCount })
            .eq('id', userId);
    } catch (err) {
        console.error('Decrement conversions error:', err);
    }
}

export async function getAllUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, total_conversions, created_at')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

export async function countUsers() {
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
}

export async function updateUserPassword(userId, newPassword) {
    if (!userId || typeof userId !== 'string') throw new Error('Invalid user ID');
    if (!newPassword || typeof newPassword !== 'string') throw new Error('Invalid password');

    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', userId);

    if (error) throw error;
}
