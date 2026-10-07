-- ==============================================================================
-- Supabase 云数据库初始化脚本 (在 Supabase 控制台 -> SQL Editor 中粘贴运行)
-- ==============================================================================

-- 1. 创建 notes 便签表 (如果尚未存在)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    color VARCHAR(32) NOT NULL DEFAULT 'yellow',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. 启用行级安全性 (Row Level Security, RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 3. 针对公共便签看板配置匿名读写策略 (如需权限管控可后续集成 Supabase Auth)
DROP POLICY IF EXISTS "Public can view notes" ON public.notes;
CREATE POLICY "Public can view notes" ON public.notes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert notes" ON public.notes;
CREATE POLICY "Public can insert notes" ON public.notes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update notes" ON public.notes;
CREATE POLICY "Public can update notes" ON public.notes
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can delete notes" ON public.notes;
CREATE POLICY "Public can delete notes" ON public.notes
    FOR DELETE USING (true);

-- 4. 插入初始化演示数据
INSERT INTO public.notes (title, content, color, tags, "isPinned")
VALUES
(
    '欢迎接入 Supabase 云端数据库！',
    '本项目已顺利切换至 Supabase (PostgreSQL) 云数据库服务。\n\n核心优势：\n1. 免除本地维护 Docker 与 MySQL 进程的负担\n2. 具备云端备份、高可用性与全球低延迟访问\n3. 支持后续接入 Supabase Auth 与实时推送 (Realtime)',
    'blue',
    '["Next.js", "Supabase", "云数据库"]'::jsonb,
    true
),
(
    'Next.js 全栈数据流架构',
    '• 服务端动作 (Server Actions)：在服务端直接调用 Supabase 客户端，保障密钥安全\n• 客户端交互：无缝响应置顶、筛选与检索\n• RESTful 接口：保留 /api/notes 与 /api/health 端点供扩展调用',
    'green',
    '["架构", "全栈"]'::jsonb,
    true
),
(
    '周末待办与学习清单',
    '1. 探索 Supabase Row Level Security (RLS) 策略\n2. 尝试添加实时订阅 (Realtime Subscription)\n3. 部署 Next.js 至 Vercel',
    'yellow',
    '["待办", "进阶"]'::jsonb,
    false
);
