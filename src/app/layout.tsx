import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "Pharmpill Biotech | Authentic Ayurvedic Remedies",
  description:
    "Experience the profound healing of purity-guaranteed botanical remedies. Handcrafted Ayurvedic formulations rooted in millennia-old traditions, delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
