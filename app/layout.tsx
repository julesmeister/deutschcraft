import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

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
  title: "Testmanship - Master German with AI-Powered Learning",
  description: "Learn German effectively with AI-generated flashcards, adaptive learning paths, and progress tracking. From A1 to C2 levels.",
  keywords: "German learning, language learning, flashcards, AI tutor, CEFR levels, vocabulary",
  authors: [{ name: "Testmanship" }],
  openGraph: {
    title: "Testmanship - Master German with AI-Powered Learning",
    description: "Learn German effectively with AI-generated flashcards and adaptive learning",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
