/** Only public offer pages are accepted; all other sign-ins retain role-based routing. */
export function getPublicOfferReturnPath(
  path: string | null | undefined,
  role: string
) {
  if (role !== 'STUDENT' && role !== 'PARENT') return null;
  return path === '/packs' || path === '/book-online' ? path : null;
}
