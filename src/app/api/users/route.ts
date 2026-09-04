import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (userId) {
    const user = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);
    const profile = await db.select().from(profiles).where(eq(profiles.userId, Number(userId))).limit(1);
    if (!user.length) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ user: user[0], profile: profile[0] || null });
  }

  const allUsers = await db.select().from(users);
  return Response.json({ users: allUsers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, provider } = body;
    if (!email) return Response.json({ error: "Email required" }, { status: 400 });

    // Check existing
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) {
      // Login flow — return existing user
      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, existing[0].id));
      return Response.json({ user: existing[0], isNew: false });
    }

    const [newUser] = await db.insert(users).values({
      email,
      name: name || email.split("@")[0],
      provider: provider || "email",
      avatar: (name || email).substring(0, 2).toUpperCase(),
      lastLogin: new Date(),
    }).returning();

    return Response.json({ user: newUser, isNew: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
