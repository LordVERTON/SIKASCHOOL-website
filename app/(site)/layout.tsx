import ClientProviders from './ClientProviders';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sika-body',
  display: 'swap',
});

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`sika-site ${poppins.variable}`}>
      <ClientProviders>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </ClientProviders>
    </div>
  );
}
