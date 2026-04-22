import type { Metadata } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const bebas = Bebas_Neue({ weight: "400", variable: "--font-bebas", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotchella — Dream Coachella lineup from your taste",
  description: "Spotify in. Drag-and-drop. A festival poster out.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} ${jakarta.variable} ${bebas.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
