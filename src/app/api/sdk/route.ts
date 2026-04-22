import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database";
import { sdkTemplates, sdkTemplateComponents } from "@/storage/database/shared/schema";
import { eq, and, desc } from "drizzle-orm";

// 获取SDK模板列表
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    // 构建查询
    let query = supabase
      .from("sdk_templates")
      .select(`
        *,
        sdk_template_components (
          *,
          ad_components (
            id,
            name,
            type,
            config
          )
        )
      `);

    if (type) {
      query = query.eq("type", type);
    }

    const { data: templates, error } = await query.order("create_time", { ascending: false });

    if (error) {
      console.error("查询SDK模板失败:", error);
      return NextResponse.json({ error: "查询失败" }, { status: 500 });
    }

    // 格式化返回数据
    const formattedTemplates = templates?.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      adSlot: template.ad_slot,
      format: template.format,
      size: template.width && template.height ? `${template.width}×${template.height}` : null,
      ratio: template.ratio,
      status: template.status,
      linkedComponentCount: template.linked_component_count,
      creator: template.creator,
      createTime: template.create_time,
      // 从关联表中获取组件信息
      componentLinks: template.sdk_template_components?.map((link: any) => ({
        id: link.id,
        componentId: link.component_id,
        componentName: link.ad_components?.name || "",
        componentType: link.ad_components?.type || "",
        componentPreview: getComponentPreviewFromConfig(link.ad_components?.config),
        parentId: link.parent_id,
        parentName: link.parent_name,
        triggerRule: link.trigger_rule,
        triggerTime: link.trigger_time,
        status: link.status,
      })) || [],
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedTemplates,
    });
  } catch (error) {
    console.error("获取SDK模板列表失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 根据组件配置获取预览图
function getComponentPreviewFromConfig(config: any): string {
  if (!config) return "";
  
  // 优先使用预览图
  if (config.previewUrl) return config.previewUrl;
  if (config.imageUrl) return config.imageUrl;
  if (config.redpacketImageUrl) return config.redpacketImageUrl;
  if (config.logoUrl) return config.logoUrl;
  
  // 获取第一张图片
  if (config.images && config.images.length > 0) {
    if (config.images[0].imageUrl) return config.images[0].imageUrl;
    if (config.images[0].imageMacro) return "";
  }
  
  return "";
}

// 创建SDK模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, name, adSlot, format, width, height, ratio, 
      creator, componentLinks 
    } = body;

    if (!type || !name) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const templateId = `sdk_${type}_${Date.now()}`;
    const templateCreator = creator || "system";

    // 插入模板主记录
    const { error: templateError } = await supabase
      .from("sdk_templates")
      .insert({
        id: templateId,
        type,
        name,
        ad_slot: adSlot,
        format: format || type,
        width: width || 0,
        height: height || 0,
        ratio: ratio || "",
        status: "enabled",
        creator: templateCreator,
        linked_component_count: componentLinks?.length || 0,
      });

    if (templateError) {
      console.error("创建SDK模板失败:", templateError);
      return NextResponse.json({ error: "创建失败" }, { status: 500 });
    }

    // 插入组件关联记录
    if (componentLinks && componentLinks.length > 0) {
      const linkRecords = componentLinks.map((link: any, index: number) => ({
        id: `link_${Date.now()}_${index}`,
        template_id: templateId,
        component_id: link.componentId,
        parent_id: link.parentId,
        parent_name: link.parentName,
        trigger_rule: link.triggerRule,
        trigger_time: link.triggerTime,
        status: link.status || "enabled",
        sort_order: index,
      }));

      const { error: linksError } = await supabase
        .from("sdk_template_components")
        .insert(linkRecords);

      if (linksError) {
        console.error("创建组件关联失败:", linksError);
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: templateId },
    });
  } catch (error) {
    console.error("创建SDK模板失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
