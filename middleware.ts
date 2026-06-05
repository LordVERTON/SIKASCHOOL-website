/**
 * Middleware de protection des routes
 * Gère l'authentification et l'autorisation basée sur les rôles
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  SESSION_CONFIG, 
  PUBLIC_ROUTES, 
  ROLE_REDIRECTS, 
  PROTECTED_ROUTES,
  type UserRole 
} from './lib/constants';

// Types
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Constantes
const SIGNIN_PATH = '/auth/signin';

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Parse et valide la session utilisateur
 */
function parseUserSession(sessionCookie: string): User | null {
  try {
    const user = JSON.parse(sessionCookie);
    
    // Vérifier que l'utilisateur a les propriétés requises
    if (!user.role || !user.id || !user.email) {
      return null;
    }

    // Vérifier que le rôle est valide
    if (!['ADMIN', 'TUTOR', 'STUDENT'].includes(user.role)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Redirige vers l'espace approprié selon le rôle
 */
function redirectToRoleSpace(user: User, request: NextRequest): NextResponse {
  const redirectPath = ROLE_REDIRECTS[user.role] || SIGNIN_PATH;
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

/**
 * Vérifie l'accès à une route protégée
 */
function checkRouteAccess(user: User, pathname: string, request: NextRequest): NextResponse | null {
  for (const [route, requiredRole] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      // Vérifier si le rôle de l'utilisateur est autorisé
      const isAuthorized = Array.isArray(requiredRole) 
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;
      
      if (!isAuthorized) {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Middleware: access denied to ${route} for role ${user.role}`);
        }
        return redirectToRoleSpace(user, request);
      }
      return null; // Accès autorisé
    }
  }
  return null; // Route non protégée
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Autoriser l'accès aux routes publiques
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Vérifier la présence de la session
  const userSession = request.cookies.get(SESSION_CONFIG.COOKIE_NAME);
  
  if (!userSession) {
    console.log('🔒 Middleware: Pas de session, redirection vers /auth/signin');
    return NextResponse.redirect(new URL(SIGNIN_PATH, request.url));
  }

  // Parser et valider la session
  const user = parseUserSession(userSession.value);
  
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('Middleware: invalid session, redirecting to signin');
    }
    return NextResponse.redirect(new URL(SIGNIN_PATH, request.url));
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(`Middleware: authenticated ${user.email} (${user.role})`);
  }
  
  // Vérifier l'accès à la route
  const accessCheck = checkRouteAccess(user, pathname, request);
  if (accessCheck) {
    return accessCheck;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API route handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
