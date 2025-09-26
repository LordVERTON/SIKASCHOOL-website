import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }


    // Si aucune notification trouvée, retourner les données mock
    if (!notifications || notifications.length === 0) {
      const mockNotifications = [
        {
          id: '1',
          title: 'Nouveau devoir assigné',
          message: 'Un nouveau devoir "Exercices de dérivées" a été assigné',
          type: 'ASSIGNMENT',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Séance confirmée',
          message: 'Votre séance de mathématiques avec Nolwen est confirmée pour demain',
          type: 'BOOKING',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Message reçu',
          message: 'Vous avez reçu un message de votre tuteur',
          type: 'MESSAGE',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      return NextResponse.json(mockNotifications);
    }

    // Transformer les données Supabase en format attendu
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
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

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marquer toutes les notifications comme lues
      const updateData = { is_read: true } as any;
      
      const { error } = await (supabase as any)
        .from('notifications')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      return NextResponse.json({ success: true });
    } else if (notificationId) {
      // Marquer une notification spécifique comme lue
      const updateData = { is_read: true } as any;
      
      const { error } = await (supabase as any)
        .from('notifications')
        .update(updateData)
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    );
  }
}
