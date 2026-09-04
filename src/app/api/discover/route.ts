import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "1";
  const skillFilter = searchParams.get("skill");
  const langFilter = searchParams.get("language");
  const styleFilter = searchParams.get("style");

  const uid = Number(userId);

  // Get current user profile
  const [myProfile] = await db.select().from(profiles).where(eq(profiles.userId, uid));
  const myLearn = new Set(myProfile?.learnSkills || []);
  const myTeach = new Set(myProfile?.teachSkills || []);

  // Get all other users with profiles
  const allUsers = await db.select().from(users).where(ne(users.id, uid));
  const allProfiles = await db.select().from(profiles);
  const profileMap = new Map(allProfiles.map(p => [p.userId, p]));

  let results = allUsers.map(u => {
    const p = profileMap.get(u.id);
    if (!p) return null;

    const theirTeach = new Set(p.teachSkills || []);
    const theirLearn = new Set(p.learnSkills || []);

    // Compatibility: what they teach that I want + what I teach that they want
    const forwardMatches = [...theirTeach].filter(s => myLearn.has(s));
    const reverseMatches = [...myTeach].filter(s => theirLearn.has(s));
    const totalPossible = Math.max(myLearn.size + theirLearn.size, 1);
    const score = Math.min(99, Math.round(((forwardMatches.length + reverseMatches.length) / totalPossible) * 100) + 30);

    return {
      user: u,
      profile: p,
      forwardMatches,
      reverseMatches,
      compatibilityScore: score,
    };
  }).filter(Boolean);

  // Apply filters
  if (skillFilter) {
    results = results.filter(r => {
      const p = r!.profile;
      return (p.teachSkills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase())) ||
             (p.learnSkills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    });
  }
  if (langFilter) {
    results = results.filter(r => {
      return (r!.profile.languages || []).some(l => l.toLowerCase().includes(langFilter.toLowerCase()));
    });
  }
  if (styleFilter) {
    results = results.filter(r => r!.profile.learningStyle === styleFilter);
  }

  // Sort by compatibility
  results.sort((a, b) => (b!.compatibilityScore) - (a!.compatibilityScore));

  // Skill recommendations
  const allTeachSkills: Record<string, number> = {};
  const allLearnSkills: Record<string, number> = {};
  allProfiles.forEach(p => {
    (p.teachSkills || []).forEach(s => { allTeachSkills[s] = (allTeachSkills[s] || 0) + 1; });
    (p.learnSkills || []).forEach(s => { allLearnSkills[s] = (allLearnSkills[s] || 0) + 1; });
  });

  // Suggest skills that are in high demand but user doesn't already know
  const recommendations = Object.entries(allLearnSkills)
    .filter(([s]) => !myTeach.has(s) && !myLearn.has(s))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, demand]) => ({ skill, demand, reason: `${demand} users want to learn this` }));

  return Response.json({ results, recommendations });
}
