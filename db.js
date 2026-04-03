// db.js — Supabase client (replaces MongoDB/Mongoose connection)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY is not set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client ready');
