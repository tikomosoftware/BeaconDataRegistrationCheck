import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Beacon Data Registration Check",
  description: "Submit iBeacon data to Supabase through a Vercel API route."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
