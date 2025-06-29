import type { Metadata } from "next";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 text-gray-900">
        <header className="bg-blue-600 text-white p-4 shadow">
          <h1 className="text-xl font-bold">MulmoCast自動作成ツール</h1>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
