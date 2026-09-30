import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vigilus Digital Cards",
    template: "%s | Vigilus"
  },
  description: "Cartes de visite digitales NFC du Groupe Vigilus.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Vigilus Cards",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#13a3e3"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
