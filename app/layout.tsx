import type { Metadata } from "next";
import "./globals.css";
import { supabase } from "@/lib/supabase";
import { ToastProvider } from "@/lib/toast-context";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data: setting } = await supabase
      .from('setting')
      .select('site_name, favicon_url_imagekit')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (setting) {
      return {
        title: setting.site_name,
        description: "Teman Baru Event Seru",
        icons: {
          icon: setting.favicon_url_imagekit || "/favicon.ico",
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch settings metadata:", error);
  }

  // Fallback metadata if settings are empty or connection fails
  return {
    title: "Seevent",
    description: "Teman Baru Event Seru",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
