import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/AppContext";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalPro",
  description: "The fastest calorie and protein tracker. No accounts, no ads.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalPro",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">

      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full">
        <AppProvider>
          <main className="min-h-full">{children}</main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
