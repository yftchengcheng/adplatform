import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database";

// 根据组件配置获取预览图
function getComponentPreviewFromConfig(config: any): string {
  if (!config) return "";
  
  if (config.previewUrl) return config.previewUrl;
  if (config.imageUrl) return config.imageUrl;
  if (config.redpacketImageUrl) return config.redpacketImageUrl;
  if (config.logoUrl) return config.logoUrl;
  
  if (config.images && config.images.length > 0) {
    if (config.images[0].imageUrl) return config.images[0].imageUrl;
  }
  
  return "";
}

// 获取单个SDK模板详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data: template, error } = await supabase
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
      `)
      .eq("id", id)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: "模板不存在" }, { status: 404 });
    }

    // 格式化返回数据
    const formattedTemplate = {
      id: template.id,
      name: template.name,
      type: template.type,
      adSlot: template.ad_slot,
      format: template.format,
      width: template.width,
      height: template.height,
      size: template.width && template.height ? `${template.width}×${template.height}` : null,
      ratio: template.ratio,
      status: template.status,
      linkedComponentCount: template.linked_component_count,
      creator: template.creator,
      createTime: template.create_time,
      updateTime: template.update_time,
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
    };

    return NextResponse.json({
      success: true,
      data: formattedTemplate,
    });
  } catch (error) {
    console.error("获取SDK模板详情失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 更新SDK模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, adSlot, format, status, componentLinks } = body;

    const supabase = getSupabaseClient();

    // 更新模板主记录
    const updateData: any = {
      update_time: new Date().toISOString(),
    };
    if (name !== undefined) updateData.name = name;
    if (adSlot !== undefined) updateData.ad_slot = adSlot;
    if (format !== undefined) updateData.format = format;
    if (status !== undefined) updateData.status = status;
    if (componentLinks !== undefined) {
      updateData.linked_component_count = componentLinks.filter((l: any) => l.status === "enabled").length;
    }

    const { error: updateError } = await supabase
      .from("sdk_templates")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("更新SDK模板失败:", updateError);
      return NextResponse.json({ error: "更新失败" }, { status: 500 });
    }

    // 更新组件关联
    if (componentLinks !== undefined) {
      // 删除旧的关联
      await supabase
        .from("sdk_template_components")
        .delete()
        .eq("template_id", id);

      // 插入新的关联
      if (componentLinks.length > 0) {
        const linkRecords = componentLinks.map((link: any, index: number) => ({
          id: link.id || `link_${Date.now()}_${index}`,
          template_id: id,
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
          console.error("更新组件关联失败:", linksError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新SDK模板失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// 删除SDK模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // 删除模板（关联的组件会自动通过CASCADE删除）
    const { error } = await supabase
      .from("sdk_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("删除SDK模板失败:", error);
      return NextResponse.json({ error: "删除失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除SDK模板失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
