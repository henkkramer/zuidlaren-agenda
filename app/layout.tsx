import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Zuidlaren Agenda",
  description: "Ontdek activiteiten in en rondom Zuidlaren."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <a className="skip-link" href="#main-content">
          Direct naar inhoud
        </a>
        {children}
      </body>
    </html>
  );
}
