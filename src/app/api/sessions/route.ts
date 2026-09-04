import { db } from "@/db";
import { sessions, matches, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const matchId = searchParams.get("matchId");

  if (matchId) {
    const result = await db.select().from(sessions).where(eq(sessions.matchId, Number(matchId)));
    return Response.json({ sessions: result });
  }

  if (userId) {
    const uid = Number(userId);
    const userMatches = await db.select().from(matches)
      .where(or(eq(matches.user1, uid), eq(matches.user2, uid)));

    const allSessions = [];
    for (const m of userMatches) {
      const s = await db.select().from(sessions).where(eq(sessions.matchId, m.id));
      const partnerId = m.user1 === uid ? m.user2 : m.user1;
      const [partner] = await db.select().from(users).where(eq(users.id, partnerId!));
      for (const sess of s) {
        allSessions.push({ ...sess, match: m, partner });
      }
    }

    // Stats
    const totalHours = allSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;
    const avgRating = allSessions.length
      ? allSessions.reduce((sum, s) => sum + (s.reviewScore || 0), 0) / allSessions.length
      : 0;

    return Response.json({
      sessions: allSessions,
      stats: {
        totalSessions: allSessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  }

  return Response.json({ error: "userId or matchId required" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, date, durationMinutes, notes, reviewScore } = body;

    const [session] = await db.insert(sessions).values({
      matchId: Number(matchId),
      date: new Date(date),
      durationMinutes: Number(durationMinutes),
      notes: notes || "",
      reviewScore: reviewScore ? Number(reviewScore) : null,
    }).returning();

    return Response.json({ session });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
