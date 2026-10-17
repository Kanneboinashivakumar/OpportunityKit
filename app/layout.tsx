import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "OpportunityKit — Turn opportunities into possibilities",
    template: "%s | OpportunityKit",
  },
  description:
    "Analyze internships, scholarships, competitions and more. Get a personalized eligibility report, find gaps, and take action — all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
