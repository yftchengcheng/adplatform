import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"
  | "video_splash"
  | "interstitial_half"
  | "interstitial_full"
  | "banner"
  | "native"
  | "rewarded_video";

// SDK模板尺寸配置
const SDK_TEMPLATE_SIZES: Record<SDKTemplateType, { width: number; height: number; ratio: string }> = {
  static_splash: { width: 1080, height: 1920, ratio: "9:16" },
  video_splash: { width: 1080, height: 1920, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 320, height: 50, ratio: "32:5" },
  native: { width: 540, height: 200, ratio: "自适应" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 初始化数据
const TEMPLATE_INITIAL_DATA: Record<SDKTemplateType, { name: string; format: string; adSlot: string }> = {
  static_splash: { name: "静态开屏模板", format: "图片", adSlot: "slot_static_splash_0001" },
  video_splash: { name: "视频开屏模板", format: "视频", adSlot: "slot_video_splash_0001" },
  interstitial_half: { name: "插屏-半屏模板", format: "图片+文字", adSlot: "slot_interstitial_half_0001" },
  interstitial_full: { name: "插屏-全屏模板", format: "图片", adSlot: "slot_interstitial_full_0001" },
  banner: { name: "横幅模板", format: "图片+文字", adSlot: "slot_banner_0001" },
  native: { name: "原生信息流模板", format: "图片+文字", adSlot: "slot_native_0001" },
  rewarded_video: { name: "激励视频模板", format: "视频", adSlot: "slot_rewarded_video_0001" },
};

// GET /api/sdk/templates - 获取所有SDK模板或按类型筛选
export async function GET(request: NextRequest) {
  const client = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as SDKTemplateType | null;

  try {
    let query = client.from("sdk_templates").select("*").order("create_time", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching SDK templates:", error);
      throw error;
    }

    // 如果没有数据，初始化每种类型的模板
    if (!data || data.length === 0) {
      const templateTypes: SDKTemplateType[] = [
        "static_splash", "video_splash", "interstitial_half", 
        "interstitial_full", "banner", "native", "rewarded_video"
      ];

      const initialTemplates = templateTypes.map((t, index) => {
        const size = SDK_TEMPLATE_SIZES[t];
        const info = TEMPLATE_INITIAL_DATA[t];
        return {
          id: `sdk_${t}_${String(index + 1).padStart(6, "0")}`,
          type: t,
          name: info.name,
          ad_slot: info.adSlot,
          format: info.format,
          width: size.width,
          height: size.height,
          ratio: size.ratio,
          status: "enabled",
          creator: "系统",
          linked_component_count: 0,
        };
      });

      // 使用 upsert 处理可能的重复键
      const { data: insertedData, error: insertError } = await client
        .from("sdk_templates")
        .upsert(initialTemplates, { onConflict: "id" })
        .select();

      if (insertError) {
        console.error("Error initializing SDK templates:", insertError);
        throw insertError;
      }

      return NextResponse.json({ success: true, data: insertedData });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("SDK templates API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SDK templates" },
      { status: 500 }
    );
  }
}

// POST /api/sdk/templates - 创建SDK模板或克隆
export async function POST(request: NextRequest) {
  const client = getSupabaseClient();

  try {
    const body = await request.json();
    const { type, name, format, adSlot, width, height, ratio, cloneFrom } = body;

    if (!type || !name) {
      return NextResponse.json(
        { success: false, error: "type and name are required" },
        { status: 400 }
      );
    }

    const id = `sdk_${type}_${Date.now()}`;
    const size = SDK_TEMPLATE_SIZES[type as SDKTemplateType] || { width: 0, height: 0, ratio: "" };

    // 如果是克隆，生成新的 ad_slot
    const newAdSlot = cloneFrom 
      ? `${adSlot}_copy_${Date.now()}`
      : adSlot;

    const newTemplate = {
      id,
      type,
      name,
      ad_slot: newAdSlot || null,
      format: format || null,
      width: width || size.width,
      height: height || size.height,
      ratio: ratio || size.ratio,
      status: "enabled",
      creator: "用户",
      linked_component_count: 0,
      create_time: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("sdk_templates")
      .insert(newTemplate)
      .select()
      .single();

    if (error) {
      console.error("Error creating SDK template:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("SDK templates API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create SDK template" },
      { status: 500 }
    );
  }
}
