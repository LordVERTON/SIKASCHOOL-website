import ClientProviders from './ClientProviders';
import { Archivo_Black, Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sika-body',
  display: 'swap',
});
const display = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sika-display',
  display: 'swap',
});

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`sika-site ${poppins.variable} ${display.variable}`}>
      <ClientProviders>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </ClientProviders>
    </div>
  );
}
