import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/storage/database/supabase-server";

// GET - 获取所有组件
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("ad_components")
      .select("*")
      .order("update_time", { ascending: false });

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - 创建组件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, config, status } = body;

    if (!id || !name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("ad_components")
      .insert([
        {
          id,
          name,
          type,
          category: body.category || "static",
          config,
          status: status || "enabled",
          editor: body.editor || "admin@adtalos.com",
          template_count: body.template_count || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - 更新组件
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, config, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Component ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const updates: Record<string, unknown> = {
      update_time: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (config !== undefined) updates.config = config;
    if (status !== undefined) updates.status = status;
    if (body.category !== undefined) updates.category = body.category;
    if (body.template_count !== undefined) updates.template_count = body.template_count;
    if (body.editor !== undefined) updates.editor = body.editor;

    const { data, error } = await supabase
      .from("ad_components")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - 删除组件
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Component ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("ad_components")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
