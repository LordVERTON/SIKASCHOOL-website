import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    threadId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;

    // Mock data - in real app, fetch from database
    const thread = {
      id: threadId,
      subject: "Question sur les dérivées",
      tutor: "M. Dupont",
      course: "Mathématiques - Terminale"
    };

    const messages = [
      {
        id: "1",
        senderId: "student",
        senderName: "Marie",
        body: "Bonjour M. Dupont, j'ai du mal à comprendre la notion de dérivée. Pourriez-vous m'expliquer avec un exemple concret ?",
        createdAt: "2024-09-15T14:25:00Z",
        isOwn: true
      },
      {
        id: "2",
        senderId: "tutor",
        senderName: "M. Dupont",
        body: "Bonjour Marie ! Bien sûr, je vais vous expliquer avec un exemple simple.\n\nPrenons la fonction f(x) = x². Sa dérivée f'(x) = 2x nous donne le coefficient directeur de la tangente en chaque point.\n\nPar exemple, en x = 3, f'(3) = 6, ce qui signifie que la tangente a un coefficient directeur de 6.",
        createdAt: "2024-09-15T14:30:00Z",
        isOwn: false
      },
      {
        id: "3",
        senderId: "student",
        senderName: "Marie",
        body: "Merci beaucoup ! C'est beaucoup plus clair maintenant. Est-ce que vous pourriez me donner un exercice pour m'entraîner ?",
        createdAt: "2024-09-15T14:35:00Z",
        isOwn: true
      }
    ];

    return NextResponse.json({ thread, messages });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;
    const body = await request.json();
    const { message, attachments } = body;

    // Mock message creation - in real app, save to database
    console.log(`Sending message to thread ${threadId}:`, { message, attachments });

    const newMessage = {
      id: Date.now().toString(),
      threadId,
      body: message,
      attachments,
      createdAt: new Date().toISOString(),
      senderId: "student",
      senderName: "Marie",
      isOwn: true
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
