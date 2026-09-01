import type { Metadata } from "next";
import { Spectral, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const display = Spectral({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const SITE_URL = "https://acquireops.io";
const DESCRIPTION =
  "Deal pipeline, underwriting calculator, and portfolio equity tracker for evaluating and growing a rental property portfolio.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AcquireOps",
    template: "%s | AcquireOps",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "AcquireOps",
    title: "AcquireOps",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "AcquireOps",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
