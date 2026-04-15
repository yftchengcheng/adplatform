import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端（服务端版本）
 * 用于服务端组件和 API Routes 使用
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.COZE_SUPABASE_URL;
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are not configured');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
