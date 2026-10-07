import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/health - Supabase 云数据库连接健康检查
export async function GET() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '未配置';

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        status: 'unconfigured',
        connected: false,
        provider: 'Supabase Cloud (PostgreSQL)',
        projectUrl,
        error: '请在 .env 中填入有效的 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  const start = Date.now();
  try {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    const latencyMs = Date.now() - start;

    if (error) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          connected: false,
          provider: 'Supabase Cloud (PostgreSQL)',
          projectUrl,
          error: error.message,
          latencyMs: `${latencyMs}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      connected: true,
      provider: 'Supabase Cloud (PostgreSQL)',
      projectUrl,
      totalNotes: count || 0,
      latencyMs: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    const message = error instanceof Error ? error.message : '连接超时或网络异常';

    return NextResponse.json(
      {
        status: 'unhealthy',
        connected: false,
        provider: 'Supabase Cloud (PostgreSQL)',
        projectUrl,
        error: message,
        latencyMs: `${latencyMs}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
