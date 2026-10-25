import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/state";

export const metadata: Metadata = {
  title: "KrishiSaathi - Soil Report to Action Plan",
  description:
    "Convert raw soil health cards into simple, voice-enabled, money-saving action plans for Indian farmers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2E7D32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-agri-bg min-h-screen text-agri-text flex flex-col antialiased">
        <AppProvider>
          <div className="flex-1 flex flex-col">{children}</div>
        </AppProvider>
      </body>
    </html>
  );
}
