import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";

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
  description: "A unique approach to learning German with AI-powered flashcards, peer collaboration, and personalized teacher feedback.",
  keywords: "German learning, language learning, flashcards, AI tutor, peer learning, teacher feedback",
  authors: [{ name: "Testmanship" }],
  openGraph: {
    title: "Testmanship - Learn German Together",
    description: "A unique approach to learning German with AI-powered flashcards, peer collaboration, and personalized teacher feedback.",
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
        <SessionProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
