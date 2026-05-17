import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export const metadata: Metadata = {
  title: "Cookie Deal — GTM Intelligence Console",
  description:
    "쿠키딜 GTM 인텔리전스 콘솔 — 다출처 분산 기업 정보를 단일 모델로 통합하는 ETL 파이프라인 + M&A 매칭 BI 대시보드",
  openGraph: {
    title: "Cookie Deal — GTM Intelligence Console",
    description:
      "중소기업 M&A 매칭을 위한 다출처 ETL 파이프라인 + 의사결정 대시보드 프로토타입",
    type: "website",
  },
  metadataBase: new URL("https://cookiedeal-gtm-console.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-fg antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
