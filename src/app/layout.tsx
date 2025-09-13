import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthKitProvider } from '@workos-inc/authkit-nextjs/components';
import PomodoroOverlay from "@/shine/pomodoro/PomodoroOverlay";
import "./globals.css";
import TopBar from "@/components/layout/top-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Shine OS",
  description: "Your calm place to focus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch app routes for instant navigation */}
        <link rel="prefetch" href="/typing" />
        <link rel="prefetch" href="/journal" />
        <link rel="prefetch" href="/pomodoro" />
        <link rel="prefetch" href="/reads" />
        <link rel="prefetch" href="/newsletter" />
        <link rel="prefetch" href="/appreciate" />
        <link rel="prefetch" href="/lounge" />

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        <AuthKitProvider>
          <TopBar />
          {children}
          <PomodoroOverlay />
        </AuthKitProvider>
      </body>
    </html>
  );
}
