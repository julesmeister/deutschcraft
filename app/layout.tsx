import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AccountHistoryProvider } from "@/components/providers/AccountHistoryProvider";
import { ToastProvider } from "@/components/ui/toast";
import { brandConfig } from "@/lib/brand-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const specialElite = localFont({
  src: "../public/fonts/SpecialElite-Regular.ttf",
  variable: "--font-special-elite",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brandConfig.name} - ${brandConfig.tagline}`,
  description: brandConfig.description,
  keywords:
    "German learning, language learning, flashcards, AI tutor, peer learning, teacher feedback",
  authors: [{ name: brandConfig.name }],
  openGraph: {
    title: `${brandConfig.name} - ${brandConfig.tagline}`,
    description: brandConfig.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${manrope.variable} ${specialElite.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <AccountHistoryProvider>
            <ToastProvider>{children}</ToastProvider>
          </AccountHistoryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
