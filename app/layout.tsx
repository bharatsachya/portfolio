import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const faviconSvg =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23FFD21E'/><text x='50' y='68' font-size='52' font-family='Arial Black' font-weight='900' text-anchor='middle' fill='%230E1116'>LG</text></svg>";

export const metadata: Metadata = {
  title: "Lovanshu Garg — Full-Stack & AI Engineer",
  description:
    "Lovanshu Garg builds web applications with machine learning inside — RAG pipelines, multi-agent systems, and the interfaces that make them usable.",
  icons: { icon: faviconSvg },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
