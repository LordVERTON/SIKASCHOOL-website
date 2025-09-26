import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - in real app, fetch from database
    const threads = [
      {
        id: "1",
        subject: "Question sur les dérivées",
        tutor: "M. Dupont",
        course: "Mathématiques - Terminale",
        lastMessage: "Merci pour votre question. Voici une explication détaillée...",
        lastMessageAt: "2024-09-15T14:30:00Z",
        unreadCount: 2,
        isUnread: true
      },
      {
        id: "2",
        subject: "Planning des séances",
        tutor: "Mme Martin", 
        course: "Physique - Terminale",
        lastMessage: "Parfait, je confirme notre séance de demain à 16h.",
        lastMessageAt: "2024-09-14T10:15:00Z",
        unreadCount: 0,
        isUnread: false
      },
      {
        id: "3",
        subject: "Correction du devoir",
        tutor: "M. Leroy",
        course: "Français - Terminale", 
        lastMessage: "Votre commentaire est très bien structuré. Quelques suggestions...",
        lastMessageAt: "2024-09-13T16:45:00Z",
        unreadCount: 0,
        isUnread: false
      }
    ];

    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, recipientId, message } = body;

    // Mock message creation - in real app, save to database
    console.log('Creating new message thread:', { subject, recipientId, message });

    const newThread = {
      id: Date.now().toString(),
      subject,
      recipientId,
      message,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(newThread);
  } catch (error) {
    console.error('Error creating message thread:', error);
    return NextResponse.json(
      { error: 'Failed to create message thread' },
      { status: 500 }
    );
  }
}
