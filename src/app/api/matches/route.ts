import { db } from "@/db";
import { matches, users, profiles } from "@/db/schema";
import { eq, or, and, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const uid = Number(userId);
    const userMatches = await db.select().from(matches)
      .where(or(eq(matches.user1, uid), eq(matches.user2, uid)));

    // Enrich with user data
    const enriched = await Promise.all(
      userMatches.map(async (m) => {
        const partnerId = m.user1 === uid ? m.user2 : m.user1;
        const [partner] = await db.select().from(users).where(eq(users.id, partnerId!));
        const [partnerProfile] = await db.select().from(profiles).where(eq(profiles.userId, partnerId!));
        return { ...m, partner, partnerProfile };
      })
    );
    return Response.json({ matches: enriched });
  }

  const all = await db.select().from(matches);
  return Response.json({ matches: all });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user1, user2 } = body;

    // Calculate compatibility
    const [p1] = await db.select().from(profiles).where(eq(profiles.userId, Number(user1)));
    const [p2] = await db.select().from(profiles).where(eq(profiles.userId, Number(user2)));

    let score = 50;
    if (p1 && p2) {
      const t1 = new Set(p1.teachSkills || []);
      const l2 = new Set(p2.learnSkills || []);
      const t2 = new Set(p2.teachSkills || []);
      const l1 = new Set(p1.learnSkills || []);

      // Skills user1 can teach that user2 wants
      const forward = [...t1].filter(s => l2.has(s)).length;
      // Skills user2 can teach that user1 wants
      const backward = [...t2].filter(s => l1.has(s)).length;

      const totalPossible = Math.max(l1.size + l2.size, 1);
      score = Math.min(99, Math.round(((forward + backward) / totalPossible) * 100) + 40);
    }

    const [match] = await db.insert(matches).values({
      user1: Number(user1),
      user2: Number(user2),
      status: "pending",
      compatibilityScore: score,
    }).returning();

    return Response.json({ match });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { matchId, status } = body;
    const [updated] = await db.update(matches).set({ status }).where(eq(matches.id, Number(matchId))).returning();
    return Response.json({ match: updated });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
