import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AccountHistoryProvider } from "@/components/providers/AccountHistoryProvider";
import { ToastProvider } from "@/components/ui/toast";

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

export const metadata: Metadata = {
  title: "Testmanship - Learn German Together",
  description:
    "A unique approach to learning German with AI-powered flashcards, peer collaboration, and personalized teacher feedback.",
  keywords:
    "German learning, language learning, flashcards, AI tutor, peer learning, teacher feedback",
  authors: [{ name: "Testmanship" }],
  openGraph: {
    title: "Testmanship - Learn German Together",
    description:
      "A unique approach to learning German with AI-powered flashcards, peer collaboration, and personalized teacher feedback.",
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
        className={`${inter.variable} ${manrope.variable} font-sans antialiased`}
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
