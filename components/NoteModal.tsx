'use client';

import React, { useState, useEffect } from 'react';
import { CreateNoteInput, NoteColor, NoteItem, UpdateNoteInput } from '@/types/note';
import { X, Check, PushPin, Tag, Palette, ArrowRight } from '@phosphor-icons/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNoteInput | UpdateNoteInput, id?: string) => Promise<void>;
  initialNote: NoteItem | null;
}

const COLORS: { value: NoteColor; label: string; bg: string; border: string }[] = [
  { value: 'yellow', label: '琥珀黄', bg: 'bg-amber-400', border: 'border-amber-400' },
  { value: 'blue', label: '天蓝', bg: 'bg-blue-500', border: 'border-blue-500' },
  { value: 'green', label: '翠绿', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  { value: 'pink', label: '玫瑰粉', bg: 'bg-rose-500', border: 'border-rose-500' },
  { value: 'purple', label: '紫罗兰', bg: 'bg-purple-500', border: 'border-purple-500' },
  { value: 'orange', label: '珊瑚橙', bg: 'bg-orange-500', border: 'border-orange-500' },
];

export default function NoteModal({ isOpen, onClose, onSubmit, initialNote }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setColor((initialNote.color as NoteColor) || 'yellow');
      setTagsInput((initialNote.tags || []).join(', '));
      setIsPinned(initialNote.isPinned);
    } else {
      setTitle('');
      setContent('');
      setColor('yellow');
      setTagsInput('');
      setIsPinned(false);
    }
    setError('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请输入标题内容');
      return;
    }

    const tags = tagsInput
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    setLoading(true);
    setError('');
    try {
      if (initialNote) {
        await onSubmit(
          {
            title: title.trim(),
            content: content.trim(),
            color,
            tags,
            isPinned,
          },
          initialNote.id
        );
      } else {
        await onSubmit({
          title: title.trim(),
          content: content.trim(),
          color,
          tags,
          isPinned,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败，请检查数据库服务');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-1.5 rounded-[2rem] bg-white/70 dark:bg-zinc-900/70 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10">
        <div className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-zinc-950 p-6 sm:p-7 border border-black/5 dark:border-white/5 space-y-5">
          {/* 模态顶栏 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                {initialNote ? '编辑便签记录' : '新增便签记录'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                数据将通过 Supabase SDK 持久化至云端 PostgreSQL
              </p>
            </div>
            <button
              onClick={onClose}
              className="touch-spring p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 表单主体 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                {error}
              </div>
            )}

            {/* 标题 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                标题 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如: 部署 Next.js 全栈到 Docker"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
                autoFocus
              />
            </div>

            {/* 内容 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                便签正文
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录详细步骤、灵感或待办事项..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 resize-none leading-relaxed"
              />
            </div>

            {/* 颜色选择 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <Palette size={14} className="text-blue-500" />
                <span>主题色调</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      c.bg
                    } ${
                      color === c.value
                        ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-950 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {color === c.value && <Check size={12} weight="bold" className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签 */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <Tag size={14} className="text-blue-500" />
                <span>分类标签 (逗号或空格隔开)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="例如: Next.js, Supabase, 全栈"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
              />
            </div>

            {/* 置顶切换 */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1.5 font-medium">
                  <PushPin size={14} className="text-amber-500" />
                  <span>置顶显示于看板首屏</span>
                </span>
              </label>
            </div>

            {/* 操作按钮栏 (Button-in-Button CTA) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="touch-spring px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full cursor-pointer"
              >
                取消
              </button>

              <button
                type="submit"
                disabled={loading}
                className="touch-spring group inline-flex items-center gap-2.5 pl-5 pr-2 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? '正在写入...' : initialNote ? '保存变更' : '写入数据库'}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={12} weight="bold" />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
