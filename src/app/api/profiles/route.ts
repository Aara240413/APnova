import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

  const result = await db.select().from(profiles).where(eq(profiles.userId, Number(userId))).limit(1);
  return Response.json({ profile: result[0] || null });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, teachSkills, learnSkills, proficiency, learningStyle, languages, weeklyAvailability, goals, timezone } = body;
    if (!userId) return Response.json({ error: "userId required" }, { status: 400 });

    const existing = await db.select().from(profiles).where(eq(profiles.userId, Number(userId))).limit(1);

    if (existing.length) {
      const [updated] = await db.update(profiles).set({
        teachSkills: teachSkills || existing[0].teachSkills,
        learnSkills: learnSkills || existing[0].learnSkills,
        proficiency: proficiency || existing[0].proficiency,
        learningStyle: learningStyle || existing[0].learningStyle,
        languages: languages || existing[0].languages,
        weeklyAvailability: weeklyAvailability || existing[0].weeklyAvailability,
        goals: goals || existing[0].goals,
        timezone: timezone || existing[0].timezone,
      }).where(eq(profiles.userId, Number(userId))).returning();
      return Response.json({ profile: updated });
    }

    const [newProfile] = await db.insert(profiles).values({
      userId: Number(userId),
      teachSkills: teachSkills || [],
      learnSkills: learnSkills || [],
      proficiency: proficiency || {},
      learningStyle: learningStyle || "interactive",
      languages: languages || ["English"],
      weeklyAvailability: weeklyAvailability || {},
      goals: goals || "",
      timezone: timezone || "UTC",
    }).returning();

    return Response.json({ profile: newProfile });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
