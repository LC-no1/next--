'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CreateNoteInput, DbStatus, NoteItem, UpdateNoteInput } from '@/types/note';
import { revalidatePath } from 'next/cache';

interface SupabaseNoteRow {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: unknown;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 格式化 Supabase 行记录
function formatNote(raw: SupabaseNoteRow): NoteItem {
  let tagsArray: string[] = [];
  if (Array.isArray(raw.tags)) {
    tagsArray = raw.tags.map(String);
  } else if (typeof raw.tags === 'string') {
    try {
      const parsed = JSON.parse(raw.tags);
      tagsArray = Array.isArray(parsed) ? parsed : [raw.tags];
    } catch {
      tagsArray = raw.tags ? [raw.tags] : [];
    }
  }

  return {
    id: raw.id,
    title: raw.title || '',
    content: raw.content || '',
    color: raw.color || 'yellow',
    tags: tagsArray,
    isPinned: Boolean(raw.isPinned),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

// 1. 获取所有便签列表
export async function getNotesAction(): Promise<NoteItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase fetch notes error:', error);
      throw new Error(`获取便签失败: ${error.message}`);
    }

    return (data as SupabaseNoteRow[]).map(formatNote);
  } catch (error: unknown) {
    console.error('Failed to fetch notes:', error);
    throw error;
  }
}

// 2. 创建便签
export async function createNoteAction(data: CreateNoteInput): Promise<NoteItem> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 环境变量尚未配置，请在 .env 中填入对应密钥');
  }

  try {
    const now = new Date().toISOString();
    const payload = {
      title: data.title.trim(),
      content: data.content.trim(),
      color: data.color || 'yellow',
      tags: data.tags || [],
      isPinned: Boolean(data.isPinned),
      createdAt: now,
      updatedAt: now,
    };

    const { data: inserted, error } = await supabase
      .from('notes')
      .insert([payload])
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || '插入记录失败');
    }

    revalidatePath('/');
    return formatNote(inserted as SupabaseNoteRow);
  } catch (error: unknown) {
    console.error('Failed to create note on Supabase:', error);
    throw error;
  }
}

// 3. 更新便签
export async function updateNoteAction(id: string, data: UpdateNoteInput): Promise<NoteItem> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 环境变量尚未配置');
  }

  try {
    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.content !== undefined) updatePayload.content = data.content.trim();
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.isPinned !== undefined) updatePayload.isPinned = Boolean(data.isPinned);

    const { data: updated, error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(error?.message || '更新记录失败');
    }

    revalidatePath('/');
    return formatNote(updated as SupabaseNoteRow);
  } catch (error: unknown) {
    console.error(`Failed to update note ${id}:`, error);
    throw error;
  }
}

// 4. 删除便签
export async function deleteNoteAction(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 环境变量尚未配置');
  }

  try {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/');
    return true;
  } catch (error: unknown) {
    console.error(`Failed to delete note ${id}:`, error);
    throw error;
  }
}

// 5. 切换置顶状态
export async function togglePinAction(id: string, currentPinStatus: boolean): Promise<NoteItem> {
  return updateNoteAction(id, { isPinned: !currentPinStatus });
}

// 6. Supabase 云端健康与连通性检查
export async function getDbHealthAction(): Promise<DbStatus> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '未配置';

  if (!isSupabaseConfigured) {
    return {
      connected: false,
      provider: 'Supabase Cloud (PostgreSQL)',
      projectUrl,
      totalNotes: 0,
      latencyMs: 0,
      error: '请在 .env 中配置 NEXT_PUBLIC_SUPABASE_URL 与 ANON_KEY',
    };
  }

  const start = Date.now();
  try {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - start;

    if (error) {
      return {
        connected: false,
        provider: 'Supabase Cloud (PostgreSQL)',
        projectUrl,
        totalNotes: 0,
        latencyMs,
        error: error.message,
      };
    }

    return {
      connected: true,
      provider: 'Supabase Cloud (PostgreSQL)',
      projectUrl,
      totalNotes: count || 0,
      latencyMs,
    };
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    const errMessage = error instanceof Error ? error.message : '网络连接超时';
    return {
      connected: false,
      provider: 'Supabase Cloud (PostgreSQL)',
      projectUrl,
      totalNotes: 0,
      latencyMs,
      error: errMessage,
    };
  }
}
