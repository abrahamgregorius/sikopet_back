import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

const supabaseUrl = config.supabase.url || process.env.SUPABASE_URL;
const supabaseKey = config.supabase.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
