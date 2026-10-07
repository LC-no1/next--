# Next.js + Supabase 云数据库全栈看板

本项目是基于 **Next.js 16 (App Router)** + **React 19** + **Supabase BaaS (PostgreSQL)** + **Tailwind CSS v4** + **Phosphor Icons** 打造的现代化全栈便签数据看板。

---

## 🛠️ 技术栈与架构

- **前端层**：Next.js 16 (Turbopack), React 19, Tailwind CSS v4, `@phosphor-icons/react` 精密图标库
- **视觉风格**：采用双层物理套壳（Double-Bezel）、嵌套胶囊按钮（Button-in-Button）以及自定义 Spring 弹簧触觉物理曲线
- **后端架构**：
  - **Server Actions**：服务端直接调用 Supabase 客户端执行数据的增删改查与置顶
  - **REST API**：提供 `/api/notes` 与 `/api/health` 统一端点
- **数据持久化**：**Supabase 云端 PostgreSQL**，支持 RLS 行级安全策略与实时扩展能力

---

## ⚡️ Supabase 云端快速接入步骤

### 第一步：创建 Supabase 项目并建表
1. 前往 [Supabase 官网](https://supabase.com/) 创建新项目。
2. 打开左侧菜单 **SQL Editor**，新建查询，将项目内的 [supabase/schema.sql](supabase/schema.sql) 文件内容完整粘贴并点击 **Run** 运行。
   - 脚本将自动建好 `notes` 表并开启 RLS 策略和演示数据。

### 第二步：配置环境变量
进入 Supabase 后台的 **Project Settings** -> **API**，复制对应的信息填入本项目的 [.env](.env) 文件中：

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
```

### 第三步：启动开发服务器
```bash
npm install
npm run dev
```

打开浏览器访问：[http://localhost:3000](http://localhost:3000)，看板顶部将实时显示与 Supabase 云端的连接状态及网络延迟。

---

## 🌐 REST API 接口清单

| 接口 | 方法 | 说明 |
| :--- | :--- | :--- |
| `/api/health` | `GET` | 探测与 Supabase 云端服务的连接健康状态与延迟 |
| `/api/notes` | `GET` | 获取便签列表 (自动按置顶与时间排序) |
| `/api/notes` | `POST` | 新增便签记录持久化至 Supabase |
| `/api/notes/:id` | `GET` | 获取单条便签详情 |
| `/api/notes/:id` | `PUT` | 更新便签内容/颜色/标签/置顶状态 |
| `/api/notes/:id` | `DELETE` | 删除便签记录 |
