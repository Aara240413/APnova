import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  if (!matchId) return Response.json({ error: "matchId required" }, { status: 400 });

  const msgs = await db.select().from(messages).where(eq(messages.matchId, Number(matchId)));

  // Enrich with sender info
  const enriched = await Promise.all(
    msgs.map(async (m) => {
      if (!m.senderId) return { ...m, sender: null };
      const [sender] = await db.select().from(users).where(eq(users.id, m.senderId));
      return { ...m, sender };
    })
  );

  return Response.json({ messages: enriched });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, senderId, content, language } = body;

    // Simple mock translation for demo
    let translatedContent: string | null = null;
    if (language && language !== "en") {
      translatedContent = `[Translated] ${content}`;
    }

    const [msg] = await db.insert(messages).values({
      matchId: Number(matchId),
      senderId: Number(senderId),
      content,
      language: language || "en",
      translatedContent,
    }).returning();

    const [sender] = await db.select().from(users).where(eq(users.id, Number(senderId)));

    return Response.json({ message: { ...msg, sender } });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
