import type { Metadata } from "next";
import "./globals.css";
import { Header } from "../components/header";
import { WhatsAppButton } from "../components/whatsapp";

export const metadata: Metadata = {
  title: "ספורט בעיר",
  description: "חנות ספורט אונליין בעברית מלאה",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  return (
    <html lang="he" dir="rtl">
      <body>
        <Header />
        {children}
        <WhatsAppButton />
        {gaId ? <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script> : null}
      </body>
    </html>
  );
}
