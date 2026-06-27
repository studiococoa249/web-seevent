import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seevent",
  description: "Teman Baru Event Seru",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
