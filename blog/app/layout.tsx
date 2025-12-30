import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { OverlayProvider } from "overlay-kit";
import { BlogHeader } from "@/components/header/blog-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeongrae's Blog",
  description: "개인적으로 경험한 고민과 경험을 정리하고 공유합니다.",
  generator: "v0.app, codex, jeongrae",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <OverlayProvider>
          <div className="min-h-screen">
            <BlogHeader />
            <main className="container mx-auto max-w-6xl px-4 py-8">
              {children}
            </main>
          </div>
          <Analytics />
        </OverlayProvider>
      </body>
    </html>
  );
}
