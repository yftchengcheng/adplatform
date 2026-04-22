import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// GET /api/sdk/templates/[id] - 获取单个SDK模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getSupabaseClient();
  const { id } = await params;

  try {
    const { data, error } = await client
      .from("sdk_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching SDK template:", error);
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("SDK template API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SDK template" },
      { status: 500 }
    );
  }
}

// PUT /api/sdk/templates/[id] - 更新SDK模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getSupabaseClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, format, adSlot, width, height, ratio, status } = body;

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
