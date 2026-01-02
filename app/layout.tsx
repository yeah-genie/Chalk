import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chalk - Learning Analytics Platform",
  description: "Turn lessons into data, and data into proof of growth. Track AP subject mastery with AI-powered analytics.",
  keywords: ["tutoring", "AP", "calculus", "physics", "learning analytics", "education", "tutor portfolio"],
};

import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa] min-h-screen pb-16 md:pb-0`}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
