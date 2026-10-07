import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js + Docker MySQL 全栈应用",
  description: "基于 Next.js 16 + React 19 + Prisma + Docker MySQL 的全栈项目",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans selection:bg-blue-500/20 selection:text-blue-700">
        {children}
      </body>
    </html>
  );
}
