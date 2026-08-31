import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "AcquireOps",
    template: "%s | AcquireOps",
  },
  description:
    "Private deal pipeline, underwriting calculator, and portfolio equity tracker for evaluating and growing a rental property portfolio.",
  robots: {
    index: false,
    follow: false,
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
        <Nav />
        {children}
      </body>
    </html>
  );
}
