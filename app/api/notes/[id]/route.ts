import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/notes/[id] - 获取单条便签
export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Supabase 未配置环境变量' },
      { status: 503 }
    );
  }

  try {
    const { id } = await props.params;
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, error: '便签不存在' },
        { status: 404 }
      );
    }

    let tags: string[] = [];
    if (Array.isArray(note.tags)) {
      tags = note.tags.map(String);
    } else if (typeof note.tags === 'string') {
      try {
        tags = JSON.parse(note.tags);
      } catch {
        tags = note.tags ? [note.tags] : [];
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...note, tags },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '查询便签失败';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - 更新便签
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Supabase 未配置环境变量' },
      { status: 503 }
    );
  }

  try {
    const { id } = await props.params;
    const body = await request.json();
    const { title, content, color, tags, isPinned } = body;

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (title !== undefined) updatePayload.title = title.trim();
    if (content !== undefined) updatePayload.content = content.trim();
    if (color !== undefined) updatePayload.color = color;
    if (tags !== undefined) updatePayload.tags = Array.isArray(tags) ? tags : [];
    if (isPinned !== undefined) updatePayload.isPinned = Boolean(isPinned);

    const { data: updated, error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { success: false, error: error?.message || '更新便签失败' },
        { status: 500 }
      );
    }

    let parsedTags: string[] = [];
    if (Array.isArray(updated.tags)) {
      parsedTags = updated.tags.map(String);
    } else if (typeof updated.tags === 'string') {
      try {
        parsedTags = JSON.parse(updated.tags);
      } catch {
        parsedTags = updated.tags ? [updated.tags] : [];
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...updated, tags: parsedTags },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '更新便签失败';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - 删除便签
export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Supabase 未配置环境变量' },
      { status: 503 }
    );
  }

  try {
    const { id } = await props.params;
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '删除便签失败';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
