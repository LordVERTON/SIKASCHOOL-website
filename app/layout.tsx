import "./globals.css";
import localFont from "next/font/local";
import { Inter } from "next/font/google";

const sensaWild = localFont({
  src: "../public/fonts/sensa-wild-fill.woff2",
  variable: "--font-sika-display",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Arial Black", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sika-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${sensaWild.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="dark:bg-black">
        {children}
      </body>
    </html>
  );
}


