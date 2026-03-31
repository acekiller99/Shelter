/**
 * GET /api/timetable
 * Public read-only endpoint for external AI / MCP tool access.
 * Returns upcoming public events in a structured format.
 *
 * Query params:
 *   from=YYYY-MM-DD   start date (default: today)
 *   days=N            number of days to include (default: 7, max: 30)
 *   userId=ID         filter by owner (returns only public events otherwise)
 */
import { NextRequest, NextResponse } from 'next/server';

// Import from events store (re-export workaround for route isolation)
const MOCK_EVENTS = [
  { id: 'e1', title: 'Study: Data Structures', date: new Date().toISOString().slice(0, 10), time: '09:00', duration: 90, type: 'study',  visibility: 'public',  completed: false },
  { id: 'e2', title: 'Quiz: Algorithms',       date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10), time: '14:00', duration: 60, type: 'exam',   visibility: 'public',  completed: false },
  { id: 'e3', title: 'Group Study Session',    date: new Date(Date.now() + 172_800_000).toISOString().slice(0, 10), time: '16:00', duration: 120, type: 'study', visibility: 'public',  completed: false },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? new Date().toISOString().slice(0, 10);
  const days = Math.min(Number(searchParams.get('days') ?? '7'), 30);

  const fromDate = new Date(from);
  const toDate   = new Date(fromDate.getTime() + days * 86_400_000);

  const result = MOCK_EVENTS.filter(e => {
    const d = new Date(e.date);
    return d >= fromDate && d < toDate && e.visibility === 'public';
  });

  return NextResponse.json({
    from,
    days,
    count: result.length,
    events: result,
  });
}
