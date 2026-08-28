import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Portal — Demo",
  description:
    "Demo frontend for the Startup Job Portal backend: browse jobs, apply, and manage listings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-muted-foreground">
              Job Portal demo · Next.js frontend for the job-portal backend.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
