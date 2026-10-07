import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/notes - 获取便签列表
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Supabase 未配置环境变量' },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const parsedNotes = (data || []).map((item) => {
      let tags: string[] = [];
      if (Array.isArray(item.tags)) {
        tags = item.tags.map(String);
      } else if (typeof item.tags === 'string') {
        try {
          tags = JSON.parse(item.tags);
        } catch {
          tags = item.tags ? [item.tags] : [];
        }
      }
      return {
        ...item,
        tags,
      };
    });

    return NextResponse.json({
      success: true,
      data: parsedNotes,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '查询数据库失败';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/notes - 创建新便签
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, error: 'Supabase 未配置环境变量' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { title, content = '', color = 'yellow', tags = [], isPinned = false } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: '标题不能为空' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          color,
          tags: Array.isArray(tags) ? tags : [],
          isPinned: Boolean(isPinned),
          createdAt: now,
          updatedAt: now,
        },
      ])
      .select()
      .single();

    if (error || !newNote) {
      return NextResponse.json(
        { success: false, error: error?.message || '创建失败' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newNote,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '创建记录失败';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
