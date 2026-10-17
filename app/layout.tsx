import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OpportunityKit — Turn announcements into action plans",
    template: "%s | OpportunityKit",
  },
  description:
    "Paste an internship, scholarship, competition or hackathon announcement. Get a deterministic eligibility audit and a deadline-aware action plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
