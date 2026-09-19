import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

/* Verified pairing: Playfair Display from "Classic Elegant" (editorial,
   magazines, high-end e-commerce) for display; Montserrat from "Luxury Serif"
   for the tracked uppercase labels. next/font self-hosts both, so there is no
   render-blocking request to Google and no layout shift on load. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Optique",
  description: "Hand-finished optical frames, measured to your face.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
