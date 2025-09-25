import ClientProviders from "./ClientProviders";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <main id="main-content">
        {children}
      </main>
    </ClientProviders>
  );
}
