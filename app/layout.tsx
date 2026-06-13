import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/AppContext";
import { BottomNav } from "@/components/BottomNav";
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
  title: "CalPro — 3-Second Calorie & Protein Tracker",
  description: "Track calories and protein in 3 seconds. Zero sign-up, offline first, optimized for one-handed logging.",
  openGraph: {
    title: "CalPro — 3-Second Calorie & Protein Tracker",
    description: "No accounts, no ads, completely offline. The fastest calorie and protein tracker.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CalPro — 3-Second Calorie & Protein Tracker",
    description: "Track calories and protein in 3 seconds. Zero sign-up, offline first.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CalPro",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F1EA",
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
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full bg-[#F4F1EA] text-[#1C1917] antialiased">
        <AppProvider>
          <div className="mx-auto flex min-h-full max-w-md flex-col bg-[#F4F1EA] shadow-xl shadow-stone-800/10">
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
