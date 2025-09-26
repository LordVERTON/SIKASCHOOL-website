import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/auth-simple';

export async function POST() {
  try {
    await clearUserSession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
