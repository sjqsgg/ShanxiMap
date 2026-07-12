import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "山西访古档案 — 山西古建筑地图",
  description:
    "532处全国重点文物保护单位的访古档案。唐构、宋金遗珍、元明古刹，为深入山西的访古旅行者而作。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* CJK 字形量大，next/font 无法子集化，用样式表渐进加载；加载失败时回落本地宋体 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
