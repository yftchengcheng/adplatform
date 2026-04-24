import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端（服务端版本）
 * 用于服务端组件和 API Routes 使用
 * 使用单例模式避免重复创建连接
 */

// 单例变量
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  // 如果已存在，直接返回
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.COZE_SUPABASE_URL;
  const serviceRoleKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are not configured');
  }

  supabaseClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}
