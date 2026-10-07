'use client';

import React, { useState, useMemo } from 'react';
import { CreateNoteInput, DbStatus, NoteColor, NoteItem, UpdateNoteInput } from '@/types/note';
import {
  createNoteAction,
  deleteNoteAction,
  getNotesAction,
  togglePinAction,
  updateNoteAction,
} from '@/app/actions/notes';
import DbStatusBadge from './DbStatusBadge';
import NoteCard from './NoteCard';
import NoteModal from './NoteModal';
import ApiDrawer from './ApiDrawer';
import {
  Plus,
  PushPin,
  MagnifyingGlass,
  ArrowsClockwise,
  SlidersHorizontal,
  Sparkle,
  Archive,
  Stack,
  ArrowRight,
} from '@phosphor-icons/react';

interface Props {
  initialNotes: NoteItem[];
  dbStatus: DbStatus;
}

const COLOR_OPTIONS: { value: string; label: string; dot: string }[] = [
  { value: 'all', label: '全部色彩', dot: 'bg-slate-400' },
  { value: 'yellow', label: '琥珀黄', dot: 'bg-amber-400' },
  { value: 'blue', label: '天蓝', dot: 'bg-blue-500' },
  { value: 'green', label: '翠绿', dot: 'bg-emerald-500' },
  { value: 'pink', label: '玫瑰粉', dot: 'bg-rose-500' },
  { value: 'purple', label: '紫罗兰', dot: 'bg-purple-500' },
  { value: 'orange', label: '珊瑚橙', dot: 'bg-orange-500' },
];

export default function NotesBoard({ initialNotes, dbStatus }: Props) {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyPinned, setOnlyPinned] = useState(false);

  // 弹窗与状态交互
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 提取唯一标签集合
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      (note.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [notes]);

  // 筛选便签数据
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = note.title.toLowerCase().includes(query);
        const matchContent = note.content.toLowerCase().includes(query);
        const matchTag = (note.tags || []).some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchContent && !matchTag) return false;
      }
      if (selectedColor !== 'all' && note.color !== selectedColor) {
        return false;
      }
      if (selectedTag && !(note.tags || []).includes(selectedTag)) {
        return false;
      }
      if (onlyPinned && !note.isPinned) {
        return false;
      }
      return true;
    });
  }, [notes, searchQuery, selectedColor, selectedTag, onlyPinned]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const regularNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const handleRefreshNotes = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await getNotesAction();
      setNotes(refreshed);
      showToast('已从 Supabase 云数据库同步最新数据集');
    } catch {
      showToast('同步刷新失败');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveNote = async (data: CreateNoteInput | UpdateNoteInput, id?: string) => {
    if (id) {
      const updated = await updateNoteAction(id, data);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      showToast('便签变更已成功持久化至 Supabase');
    } else {
      const created = await createNoteAction(data as CreateNoteInput);
      setNotes((prev) => [created, ...prev]);
      showToast('新记录已写入 Supabase 云数据库');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('确认从 Supabase 数据表中永久移除此项记录？')) return;
    try {
      await deleteNoteAction(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('记录已自数据表删除');
    } catch {
      showToast('删除失败');
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      const updated = await togglePinAction(id, currentPin);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      showToast(updated.isPinned ? '已置顶' : '已取消置顶');
    } catch {
      showToast('置顶变更失败');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-7">
      {/* 悬浮顶栏：Detached Island Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Stack size={20} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Next.js 全栈数据看板
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                SUPABASE BAAS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              基于 App Router 与 Server Actions 直连 Supabase 云端 PostgreSQL 数据库
            </p>
          </div>
        </div>

        {/* 顶部操作区 (Button-in-Button CTA) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshNotes}
            disabled={isRefreshing}
            className="touch-spring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200/80 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <ArrowsClockwise size={14} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
            <span>刷新数据</span>
          </button>

          <button
            onClick={() => {
              setEditingNote(null);
              setModalOpen(true);
            }}
            className="touch-spring group inline-flex items-center gap-2.5 pl-5 pr-2 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <span>新建便签</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={13} weight="bold" />
            </span>
          </button>
        </div>
      </div>

      {/* 核心指标卡 (Double-Bezel 架构) */}
      <DbStatusBadge initialStatus={dbStatus} />

      {/* 开发者 API 调试抽屉 */}
      <ApiDrawer />

      {/* 筛选与检索控制台 (Double-Bezel 架构) */}
      <div className="bezel-shell">
        <div className="bezel-core p-4 md:p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题、内容摘要或分类标签..."
                className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-zinc-100 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  清空
                </button>
              )}
            </div>

            {/* 仅看置顶切换 */}
            <button
              onClick={() => setOnlyPinned(!onlyPinned)}
              className={`touch-spring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border cursor-pointer shrink-0 ${
                onlyPinned
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <PushPin size={14} weight={onlyPinned ? 'fill' : 'regular'} className={onlyPinned ? 'text-amber-500' : ''} />
              <span>仅看置顶</span>
            </button>
          </div>

          {/* 色彩与标签微交互过滤器 */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 mr-1">
              <SlidersHorizontal size={14} />
              <span>色彩:</span>
            </div>

            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className={`touch-spring inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                  selectedColor === c.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                    : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedColor === c.value ? 'bg-white' : c.dot}`} />
                <span>{c.label}</span>
              </button>
            ))}

            {allTags.length > 0 && (
              <>
                <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-2" />
                <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 mr-1">
                  <span>标签:</span>
                </div>

                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="touch-spring px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs hover:bg-slate-300 cursor-pointer"
                  >
                    清除: #{selectedTag} ✕
                  </button>
                )}

                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`touch-spring px-2 py-0.5 rounded-md text-xs font-mono border cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 数据列表呈现 */}
      {filteredNotes.length === 0 ? (
        <div className="bezel-shell">
          <div className="bezel-core p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
              <Archive size={24} weight="duotone" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              未检索到匹配的便签数据
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              当前检索或筛选规则下暂无记录，可尝试清空过滤条件或创建新的便签条目。
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setEditingNote(null);
                  setModalOpen(true);
                }}
                className="touch-spring inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                <Plus size={14} weight="bold" />
                <span>立即创建便签</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 置顶分区 */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                <PushPin size={14} weight="fill" />
                <span>置顶条目 ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(item) => {
                      setEditingNote(item);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 常规分区 */}
          {regularNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  <span>常规条目 ({regularNotes.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(item) => {
                      setEditingNote(item);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteNote}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 弹窗 */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveNote}
        initialNote={editingNote}
      />

      {/* 浮动轻量 Toast 提示 */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 text-xs font-medium shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkle size={15} weight="fill" className="text-amber-400 dark:text-amber-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
