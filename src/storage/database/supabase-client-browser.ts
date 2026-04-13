import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端
 * 用于客户端组件使用已注入的环境变量
 */
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(url, anonKey);
}
