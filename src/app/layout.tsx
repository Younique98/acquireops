import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
