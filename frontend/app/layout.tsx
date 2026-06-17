import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/AppContext";
import { LayoutShell } from "@/components/LayoutShell";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LogMyMeal — Calorie & Protein Tracker",
  description: "Track calories and protein in seconds. Zero sign-up, offline first, optimized for desktop and mobile logging.",
  openGraph: {
    title: "LogMyMeal — Calorie & Protein Tracker",
    description: "No accounts, no ads, completely offline. The fastest calorie and protein tracker.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogMyMeal — Calorie & Protein Tracker",
    description: "Track calories and protein in seconds. Zero sign-up, offline first.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LogMyMeal",
  },
};

export const viewport: Viewport = {
  themeColor: "#1DB954",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full hide-scrollbar`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full bg-[#F3F4F6] text-[#111827] antialiased hide-scrollbar">
        <AppProvider>
          <LayoutShell>{children}</LayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}
