import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/AppContext";
import { LayoutShell } from "@/components/LayoutShell";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LogMyMeal — 3-Second Calorie & Protein Tracker",
  description: "Track calories and protein in 3 seconds. Zero sign-up, offline first, optimized for desktop and mobile logging.",
  openGraph: {
    title: "LogMyMeal — 3-Second Calorie & Protein Tracker",
    description: "No accounts, no ads, completely offline. The fastest calorie and protein tracker.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogMyMeal — 3-Second Calorie & Protein Tracker",
    description: "Track calories and protein in 3 seconds. Zero sign-up, offline first.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LogMyMeal",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
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
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full hide-scrollbar`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full bg-[#0c0c0e] text-white antialiased hide-scrollbar">
        <AppProvider>
          <LayoutShell>{children}</LayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}
