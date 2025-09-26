import { NextRequest } from "next/server";
import { getUserSession } from "./auth-simple";

export enum Role {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR", 
  STUDENT = "STUDENT"
}

export async function requireAuth(request: NextRequest) {
  const session = await getUserSession();
  
  if (!session) {
    return null;
  }
  
  return session;
}

export async function requireRole(request: NextRequest, requiredRole: Role) {
  const session = await requireAuth(request);
  
  if (!session) {
    return null;
  }
  
  const userRole = (session as any).role;
  
  if (userRole !== requiredRole) {
    return null;
  }
  
  return session;
}

export async function requireStudent(request: NextRequest) {
  return requireRole(request, Role.STUDENT);
}

export async function requireTutor(request: NextRequest) {
  return requireRole(request, Role.TUTOR);
}

export async function requireAdmin(request: NextRequest) {
  return requireRole(request, Role.ADMIN);
}

export function hasRole(session: any, role: Role): boolean {
  return (session as any)?.role === role;
}

export function isStudent(session: any): boolean {
  return hasRole(session, Role.STUDENT);
}

export function isTutor(session: any): boolean {
  return hasRole(session, Role.TUTOR);
}

export function isAdmin(session: any): boolean {
  return hasRole(session, Role.ADMIN);
}
