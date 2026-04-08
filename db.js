// db.js — Supabase client (replaces MongoDB/Mongoose connection)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = serviceRoleKey || anonKey;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env');
}

if (process.env.NODE_ENV === 'production' && !serviceRoleKey) {
    console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is required in production when RLS is enabled.');
    process.exit(1);
}

// Use service role key on the server to bypass RLS (never expose this key to the client)
export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client ready');
