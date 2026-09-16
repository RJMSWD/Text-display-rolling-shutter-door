import type { Metadata } from "next";
import "./globals.css";
import "./content.css";

export const metadata: Metadata = {
  title: "Budarina — Tactile Atlas",
  description: "A tactile Silk Road atlas where language behaves like cloth.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif&family=Noto+Serif:wght@400&family=Noto+Serif+JP:wght@400&family=Noto+Serif+SC:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
