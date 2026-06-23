import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://wavefront.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Wavefront — See how fast a tsunami crosses an ocean",
  description:
    "A preparedness visualization grounded in real ocean-depth physics. Watch a tsunami race across the sea from history's deadliest earthquakes, and feel why your first minutes decide everything. No login.",
  keywords: [
    "tsunami",
    "tsunami travel time",
    "earthquake",
    "coastal safety",
    "preparedness",
    "evacuation",
    "wavefront",
  ],
  authors: [{ name: "Ronit Chawla" }],
  openGraph: {
    title: "Wavefront — See how fast a tsunami crosses an ocean",
    description:
      "Watch a tsunami race across the sea from history's deadliest earthquakes. Real ocean-depth physics. Why your first minutes decide everything.",
    url: siteUrl,
    siteName: "Wavefront",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wavefront — See how fast a tsunami crosses an ocean",
    description:
      "A preparedness visualization grounded in real ocean-depth physics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-abyss text-ink">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
