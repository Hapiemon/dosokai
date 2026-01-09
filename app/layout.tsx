import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "同窓会 出欠確認フォーム",
  description: "2026年5月3日開催の同窓会 出欠確認",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
