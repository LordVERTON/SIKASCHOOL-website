# Security Policy

## Security Measures Implemented

### 1. Input Validation & Sanitization
- Email validation with regex patterns
- String sanitization to prevent XSS attacks
- Input length limits and type checking
- Tutor ID validation against whitelist

### 2. Security Headers

The versioned `next.config.js` configures the following response headers:

| Header | Value |
| --- | --- |
| X-DNS-Prefetch-Control | on |
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| X-XSS-Protection | 1; mode=block (legacy browser header) |
| Referrer-Policy | origin-when-cross-origin |

`poweredByHeader` is disabled. CSP and HSTS are **not configured in this
repository**. No claim is made about additional hosting headers without a
deployment check. A future CSP must account for LiveKit, Stripe, Supabase,
fonts and realtime connections before enforcement. HSTS requires validation
of the canonical HTTPS domain and its subdomains.

### Authorization and payments — 14 November 2026

- Administrator access requires the persisted `ADMIN` profile role. E-mail
  addresses and notification recipients do not grant permissions. A tutor
  formerly admitted by e-mail needs an explicit persisted role change by an
  authorized administrator; this release does not promote accounts.
- API session helpers recheck the active profile and its current role; a
  disabled account or a revoked administrator role cannot rely on an old JWT.
- The Stripe signature is checked on the original request body. Settlement
  triggers one database transaction for payment, ledger and balance. Event
  and payment-source uniqueness prevent concurrent/repeated crediting.
- Apply `20261114154431_stripe_atomic_credits.sql` before the webhook change.
  It grants RPC execution only to `service_role`, uses security invoker, and
  aborts on duplicate legacy invoice references. Already-paid legacy entries
  without a reliable ledger reference require reconciliation before replay.
- DB errors return HTTP 500 to Stripe for retry. Logs contain event ID/type,
  without customer payloads. Refund credit reversal remains subject to the
  commercial rules in SK-001; it is not implemented by this transaction.

Dependency audit on 14 November 2026: Next.js 16.4.6 and Zod 4.6.6 replace
the vulnerable versions. After compatible fixes, `npm audit` reports no
critical vulnerabilities; three high alerts (Nodemailer and its Auth.js
dependency chain) and seven moderate development-tool alerts remain. Their major updates require separate
compatibility checks; `npm audit fix --force` was not used.

### 3. TypeScript Configuration
- Strict mode enabled
- Strict null checks
- Force consistent casing in file names
- No implicit any types

### 4. Error Handling
- Global ErrorBoundary component
- Secure logging with sensitive data redaction
- Proper error messages without information leakage

### 5. Storage Security
- Safe localStorage operations with error handling
- Server-side rendering compatibility
- Input validation before storage

### 6. Dependencies
- Regular security audits with `npm audit`
- ESLint security plugin
- Up-to-date dependencies

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it to:
- Email: security@sikaschool.com
- Please include:
  - Description of the vulnerability
  - Steps to reproduce
  - Potential impact
  - Suggested fix (if any)

## Security Best Practices

### For Developers
1. Always validate and sanitize user inputs
2. Use TypeScript strict mode
3. Run security audits regularly
4. Keep dependencies updated
5. Follow the principle of least privilege
6. Log security events appropriately

### For Deployment
1. Use HTTPS in production
2. Set secure environment variables
3. Enable security headers
4. Monitor for security issues
5. Regular security updates

## Security Checklist

- [x] Input validation implemented
- [x] Security headers configured
- [x] Error handling in place
- [x] TypeScript strict mode enabled
- [x] ESLint security rules configured
- [x] Secure logging implemented
- [x] ErrorBoundary component added
- [x] Accessibility features implemented
- [x] Image optimization configured
- [x] Environment variables validation

## Regular Security Tasks

1. **Weekly**: Run `npm audit` and fix vulnerabilities
2. **Monthly**: Update dependencies
3. **Quarterly**: Security code review
4. **Annually**: Penetration testing (when applicable)
