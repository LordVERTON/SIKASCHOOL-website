import "./globals.css";
import localFont from "next/font/local";

const sensaWild = localFont({
  src: "../public/fonts/sensa-wild-fill.woff2",
  variable: "--font-sika-display",
  weight: "400",
  style: "normal",
  display: "swap",
  fallback: ["Arial Black", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

const sourceHanSerif = localFont({
  src: "../public/fonts/source-han-serif-jp-variable.woff2",
  variable: "--font-sika-body",
  weight: "200 900",
  style: "normal",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${sensaWild.variable} ${sourceHanSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="dark:bg-black">
        {children}
      </body>
    </html>
  );
}


