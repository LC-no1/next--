import { createClient } from '@supabase/supabase-js';

// 获取并清洗 Supabase URL（自动移除尾部 /rest/v1 或斜杠）
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// 校验环境变量是否已经有效配置
export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  supabaseAnonKey &&
  cleanUrl.startsWith('http') &&
  !cleanUrl.includes('your-project')
);

export const supabase = createClient(
  isSupabaseConfigured ? cleanUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
);

export default supabase;
