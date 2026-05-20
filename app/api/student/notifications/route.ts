import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { isSupabaseUnreachableError, supabaseAdmin } from '@/lib/supabase';
import { publishUserMercureUpdate } from '@/lib/mercure';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notifications, error } = await (supabaseAdmin as any)
      .from('notifications')
      .select('id, title, message, type, data, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSupabaseUnreachableError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[notifications] Supabase injoignable (ex. npx supabase start). Réponse vide.',
          );
        }
        return NextResponse.json([]);
      }
      throw error;
    }

    const formattedNotifications = (notifications || []).map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      data: notification.data ?? null
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    if (isSupabaseUnreachableError(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[notifications] Supabase injoignable (ex. npx supabase start). Réponse vide.',
        );
      }
      return NextResponse.json([]);
    }
    console.error('Erreur récupération notifications étudiant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      const updateData = { is_read: true } as any;

      const { error } = await (supabaseAdmin as any)
        .from('notifications')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        if (isSupabaseUnreachableError(error)) {
          return NextResponse.json(
            { error: 'Base de données indisponible', code: 'SUPABASE_UNREACHABLE' },
            { status: 503 },
          );
        }
        throw error;
      }

      await publishUserMercureUpdate([user.id], {
        type: 'notification',
        action: 'read-all',
        userId: user.id,
      });

      return NextResponse.json({ success: true });
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      const updateData = { is_read: true } as any;
      
      const { error } = await (supabaseAdmin as any)
        .from('notifications')
        .update(updateData)
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        if (isSupabaseUnreachableError(error)) {
          return NextResponse.json(
            { error: 'Base de données indisponible', code: 'SUPABASE_UNREACHABLE' },
            { status: 503 },
          );
        }
        throw error;
      }

      await publishUserMercureUpdate([user.id], {
        type: 'notification',
        action: 'read',
        userId: user.id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    if (isSupabaseUnreachableError(error)) {
      return NextResponse.json(
        { error: 'Base de données indisponible', code: 'SUPABASE_UNREACHABLE' },
        { status: 503 },
      );
    }
    console.error('Erreur mise à jour notifications étudiant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    );
  }
}
