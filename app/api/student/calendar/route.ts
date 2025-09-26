import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    searchParams.get('month');
    searchParams.get('year');

    // Mock data - in real app, fetch from database based on month/year
    const events = [
      {
        id: "1",
        title: "Séance Maths avec M. Dupont",
        date: "2024-09-15",
        time: "14:00",
        type: "cours",
        color: "bg-blue-500",
        duration: 60
      },
      {
        id: "2", 
        title: "Rendu devoir Physique",
        date: "2024-09-16",
        time: "23:59",
        type: "devoir",
        color: "bg-red-500",
        duration: 0
      },
      {
        id: "3",
        title: "Séance Français avec M. Leroy", 
        date: "2024-09-18",
        time: "16:00",
        type: "cours",
        color: "bg-green-500",
        duration: 60
      },
      {
        id: "4",
        title: "Quiz Histoire",
        date: "2024-09-20",
        time: "10:00",
        type: "évaluation",
        color: "bg-purple-500",
        duration: 90
      },
      {
        id: "5",
        title: "Révision Mathématiques",
        date: "2024-09-22",
        time: "15:00",
        type: "révision",
        color: "bg-orange-500",
        duration: 120
      }
    ];

    const upcomingEvents = events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return NextResponse.json({ events, upcomingEvents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
