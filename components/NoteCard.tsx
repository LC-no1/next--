'use client';

import React from 'react';
import { NoteItem } from '@/types/note';
import { PushPin, Trash, PencilSimple, CalendarBlank } from '@phosphor-icons/react';

interface Props {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, currentPin: boolean) => void;
}

const THEMES: Record<
  string,
  {
    shell: string;
    core: string;
    badge: string;
    pinActive: string;
    accentBar: string;
  }
> = {
  yellow: {
    shell: 'bg-amber-500/5 ring-1 ring-amber-500/15 hover:ring-amber-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
    pinActive: 'text-amber-600 bg-amber-500/15 border-amber-500/20',
    accentBar: 'bg-amber-400',
  },
  blue: {
    shell: 'bg-blue-500/5 ring-1 ring-blue-500/15 hover:ring-blue-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20',
    pinActive: 'text-blue-600 bg-blue-500/15 border-blue-500/20',
    accentBar: 'bg-blue-500',
  },
  green: {
    shell: 'bg-emerald-500/5 ring-1 ring-emerald-500/15 hover:ring-emerald-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
    pinActive: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/20',
    accentBar: 'bg-emerald-500',
  },
  pink: {
    shell: 'bg-rose-500/5 ring-1 ring-rose-500/15 hover:ring-rose-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
    pinActive: 'text-rose-600 bg-rose-500/15 border-rose-500/20',
    accentBar: 'bg-rose-500',
  },
  purple: {
    shell: 'bg-purple-500/5 ring-1 ring-purple-500/15 hover:ring-purple-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20',
    pinActive: 'text-purple-600 bg-purple-500/15 border-purple-500/20',
    accentBar: 'bg-purple-500',
  },
  orange: {
    shell: 'bg-orange-500/5 ring-1 ring-orange-500/15 hover:ring-orange-500/30',
    core: 'bg-white dark:bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    badge: 'bg-orange-500/10 text-orange-800 dark:text-orange-300 border-orange-500/20',
    pinActive: 'text-orange-600 bg-orange-500/15 border-orange-500/20',
    accentBar: 'bg-orange-500',
  },
};

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }: Props) {
  const theme = THEMES[note.color] || THEMES.yellow;

  const formattedDate = new Date(note.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`group p-1.5 rounded-3xl transition-all duration-300 ${theme.shell}`}>
      <div className={`rounded-[calc(1.5rem-0.375rem)] p-5 flex flex-col justify-between h-full border border-black/5 dark:border-white/5 ${theme.core}`}>
        <div>
          {/* 顶栏：色块标记、标题与置顶交互 */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <span className={`w-1.5 h-4.5 rounded-full mt-0.5 shrink-0 ${theme.accentBar}`} />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug line-clamp-2">
                {note.title}
              </h3>
            </div>

            <button
              onClick={() => onTogglePin(note.id, note.isPinned)}
              className={`touch-spring p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                note.isPinned
                  ? theme.pinActive
                  : 'text-slate-400 dark:text-zinc-500 border-transparent hover:border-slate-200 dark:hover:border-zinc-700 hover:text-slate-700 dark:hover:text-zinc-200 opacity-60 group-hover:opacity-100'
              }`}
              title={note.isPinned ? '取消置顶' : '置顶'}
            >
              <PushPin size={16} weight={note.isPinned ? 'fill' : 'regular'} />
            </button>
          </div>

          {/* 正文内容 */}
          <p className="mt-3.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {note.content}
          </p>

          {/* 标签 */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono rounded-md border ${theme.badge}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 底部信息与动作栏 */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5 font-mono">
            <CalendarBlank size={13} />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(note)}
              className="touch-spring p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
              title="编辑记录"
            >
              <PencilSimple size={15} />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="touch-spring p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 hover:text-rose-600 cursor-pointer"
              title="删除记录"
            >
              <Trash size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
