import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { updateUserPassword } from '@/lib/user-management';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await getUserSession();
  if (!admin || !canAccessAdminFeatures(admin)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const temporaryPassword = `Sika-${randomBytes(9).toString('base64url')}!`;
    await updateUserPassword(userId, temporaryPassword);
    return NextResponse.json({
      success: true,
      tempPassword: temporaryPassword,
      message: 'Mot de passe temporaire créé dans Supabase Auth',
    });
  } catch (error) {
    console.error('[admin/reset-password]', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
