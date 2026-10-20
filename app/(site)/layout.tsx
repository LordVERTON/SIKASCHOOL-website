import ClientProviders from './ClientProviders';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sika-site">
      <ClientProviders>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </ClientProviders>
    </div>
  );
}
