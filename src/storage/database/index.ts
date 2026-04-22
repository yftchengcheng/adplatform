import { getSupabaseServerClient } from "./supabase-server";
import { createClient as createBrowserClient, SupabaseClient } from "@supabase/supabase-js";

// 服务器端获取supabase客户端
export function getSupabaseClient() {
  return getSupabaseServerClient();
}

// 浏览器端获取supabase客户端（使用环境变量）
export function getSupabaseClientBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createBrowserClient(url, anonKey);
}
