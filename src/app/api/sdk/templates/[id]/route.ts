import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// GET /api/sdk/templates/[id] - 获取单个SDK模板（含组件关联配置）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getSupabaseClient();
  const { id } = await params;

  try {
    // 获取模板基本信息
    const { data: template, error: templateError } = await client
      .from("sdk_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (templateError) {
      console.error("Error fetching SDK template:", templateError);
      throw templateError;
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    // 获取组件关联配置
    const { data: componentLinks, error: linksError } = await client
      .from("sdk_template_components")
      .select("*")
      .eq("template_id", id)
      .order("sort_order", { ascending: true });

    if (linksError) {
      console.error("Error fetching component links:", linksError);
      // 不抛错，返回空关联
    }

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        componentLinks: componentLinks || [],
      },
    });
  } catch (err) {
    console.error("SDK template API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SDK template" },
      { status: 500 }
    );
  }
}

// PUT /api/sdk/templates/[id] - 更新SDK模板（含组件关联配置）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getSupabaseClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, format, adSlot, width, height, ratio, status, componentLinks } = body;

    // 1. 更新模板基本信息
    const updateData: Record<string, unknown> = {
      update_time: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (format !== undefined) updateData.format = format;
    if (adSlot !== undefined) updateData.ad_slot = adSlot;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (ratio !== undefined) updateData.ratio = ratio;
    if (status !== undefined) updateData.status = status;

    // 更新关联组件计数
    if (componentLinks !== undefined) {
      const enabledCount = componentLinks.filter(
        (l: { status: string }) => l.status === "enabled"
      ).length;
      updateData.linked_component_count = enabledCount;
    }

    const { data, error } = await client
      .from("sdk_templates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating SDK template:", error);
      throw error;
    }

    // 2. 如果传了组件关联配置，则全量更新
    if (componentLinks !== undefined) {
      // 先删除该模板的所有旧关联
      const { error: deleteError } = await client
        .from("sdk_template_components")
        .delete()
        .eq("template_id", id);

      if (deleteError) {
        console.error("Error deleting old component links:", deleteError);
        throw deleteError;
      }

      // 如果有新关联，批量插入
      if (componentLinks.length > 0) {
        const insertRows = componentLinks.map(
          (link: {
            id: string;
            componentId: string;
            componentTypeKey?: string;
            componentConfig?: Record<string, unknown>;
            parentId: string;
            parentName: string;
            triggerRule: string;
            triggerTime?: number;
            status: string;
            sortOrder: number;
          }, index: number) => ({
            id: link.id,
            template_id: id,
            component_id: link.componentId,
            component_type_key: link.componentTypeKey || null,
            component_config: link.componentConfig || null,
            parent_id: link.parentId || "main",
            parent_name: link.parentName || "主素材",
            trigger_rule: link.triggerRule,
            trigger_time: link.triggerTime || null,
            status: link.status,
            sort_order: index,
            create_time: new Date().toISOString(),
          })
        );

        const { error: insertError } = await client
          .from("sdk_template_components")
          .insert(insertRows);

        if (insertError) {
          console.error("Error inserting component links:", insertError);
          throw insertError;
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("SDK template API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update SDK template" },
      { status: 500 }
    );
  }
}

// DELETE /api/sdk/templates/[id] - 删除SDK模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getSupabaseClient();
  const { id } = await params;

  try {
    // 先删除关联的组件
    const { error: linksDeleteError } = await client
      .from("sdk_template_components")
      .delete()
      .eq("template_id", id);

    if (linksDeleteError) {
      console.error("Error deleting component links:", linksDeleteError);
    }

    // 再删除模板
    const { error } = await client
      .from("sdk_templates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting SDK template:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SDK template API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete SDK template" },
      { status: 500 }
    );
  }
}
