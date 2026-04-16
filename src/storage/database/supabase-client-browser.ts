import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 获取 Supabase 客户端（浏览器版本）
 * 用于客户端组件使用已注入的环境变量
 * 使用单例模式避免重复创建连接
 */

// 单例变量
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  // 如果已存在，直接返回
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_COZE_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}
