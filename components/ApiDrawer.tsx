'use client';

import React, { useState } from 'react';
import { Terminal, Play, CaretDown, CaretUp, Copy, Check } from '@phosphor-icons/react';

export default function ApiDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('/api/health');
  const [responseJson, setResponseJson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const testEndpoint = async (url: string) => {
    setActiveEndpoint(url);
    setLoading(true);
    setResponseJson('');
    try {
      const res = await fetch(url);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setResponseJson(JSON.stringify({ error: err instanceof Error ? err.message : '网络请求失败' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bezel-shell">
      <div className="bezel-core overflow-hidden">
        {/* 折叠触发条 */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="touch-spring flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100/50 dark:hover:bg-zinc-900/80 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Terminal size={14} weight="bold" />
            </div>
            <span className="text-xs font-semibold tracking-tight text-slate-800 dark:text-zinc-200">
              REST API 开发者交互调试终端
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              NEXT ROUTE HANDLERS
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
            <span>{isOpen ? '折叠调试器' : '展开在线请求'}</span>
            {isOpen ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </div>
        </div>

        {/* 展开的调试内容 */}
        {isOpen && (
          <div className="p-5 border-t border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => testEndpoint('/api/health')}
                disabled={loading}
                className={`touch-spring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border cursor-pointer disabled:opacity-50 ${
                  activeEndpoint === '/api/health'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Play size={12} weight="fill" />
                <span>GET /api/health</span>
              </button>

              <button
                onClick={() => testEndpoint('/api/notes')}
                disabled={loading}
                className={`touch-spring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border cursor-pointer disabled:opacity-50 ${
                  activeEndpoint === '/api/notes'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Play size={12} weight="fill" />
                <span>GET /api/notes</span>
              </button>
            </div>

            {/* 响应代码块 */}
            {responseJson && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-900/10 dark:border-white/10 shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-slate-400 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>200 OK: {activeEndpoint}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(responseJson)}
                    className="touch-spring flex items-center gap-1 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? '已复制' : '复制'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  {responseJson}
                </pre>
              </div>
            )}

            {/* 架构提示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs font-mono text-slate-500 dark:text-zinc-400">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <span className="text-blue-600 dark:text-blue-400 font-bold">POST</span> /api/notes
                <p className="text-[11px] font-sans text-slate-500 dark:text-zinc-400 mt-1">
                  写入全新记录，接收 title, content, color, tags JSON 载荷
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <span className="text-amber-600 dark:text-amber-400 font-bold">PUT</span> /api/notes/:id
                <p className="text-[11px] font-sans text-slate-500 dark:text-zinc-400 mt-1">
                  按记录 UUID 维度执行字段更新与置顶状态反转
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
