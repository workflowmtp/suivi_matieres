import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suivi Chantier Mireille",
  description: "Application Next.js de suivi chantier"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
