'use client';

import React, { useState } from 'react';
import { DbStatus } from '@/types/note';
import { getDbHealthAction } from '@/app/actions/notes';
import { Cloud, ArrowsClockwise, Globe, Sparkle } from '@phosphor-icons/react';

interface Props {
  initialStatus: DbStatus;
}

export default function DbStatusBadge({ initialStatus }: Props) {
  const [status, setStatus] = useState<DbStatus>(initialStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const nextStatus = await getDbHealthAction();
      setStatus(nextStatus);
    } catch {
      setStatus((prev) => ({
        ...prev,
        connected: false,
        error: '云数据库刷新连接异常',
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  // 截断或美化展示 URL
  const displayUrl = status.projectUrl?.replace('https://', '').replace('.supabase.co', '') || '未配置';

  return (
    <div className="bezel-shell">
      <div className="bezel-core p-4 md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 左侧：状态核心 */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                status.connected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-xs'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}
            >
              <Cloud size={22} weight="duotone" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  Supabase Cloud Database
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                    status.connected
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {status.connected ? `云端已连通 (${status.latencyMs}ms)` : '待配置 / 离线'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {status.connected
                  ? `PostgreSQL 实例在线 | 现有 ${status.totalNotes} 条便签记录已持久化至云端`
                  : status.error || '未检测到云端配置，请在 .env 中填入 Supabase URL 和 Key'}
              </p>
            </div>
          </div>

          {/* 右侧：端点与测试按钮 */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-300">
              <Globe size={15} weight="duotone" className="text-emerald-500" />
              <span className="text-slate-400 dark:text-zinc-500">Project:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{displayUrl}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="touch-spring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer disabled:opacity-50"
              title="重新探测 Supabase 云端通信响应"
            >
              <ArrowsClockwise size={14} className={isRefreshing ? 'animate-spin text-emerald-500' : ''} />
              <span>检测连接</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
