import { db } from "@/db";
import { users, profiles, matches, sessions } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allProfiles = await db.select().from(profiles);
    const allUsers = await db.select().from(users);
    const allMatches = await db.select().from(matches);
    const allSessions = await db.select().from(sessions);

    // Skills supply (teach) vs demand (learn)
    const supply: Record<string, number> = {};
    const demand: Record<string, number> = {};

    allProfiles.forEach((p) => {
      (p.teachSkills || []).forEach((s) => { supply[s] = (supply[s] || 0) + 1; });
      (p.learnSkills || []).forEach((s) => { demand[s] = (demand[s] || 0) + 1; });
    });

    // All unique skills
    const allSkills = [...new Set([...Object.keys(supply), ...Object.keys(demand)])];

    const skillAnalytics = allSkills.map((skill) => ({
      skill,
      supply: supply[skill] || 0,
      demand: demand[skill] || 0,
      gap: (demand[skill] || 0) - (supply[skill] || 0),
    }));

    skillAnalytics.sort((a, b) => b.gap - a.gap);

    // Top in-demand
    const inDemand = skillAnalytics.filter(s => s.gap > 0).slice(0, 6);
    // Oversupplied
    const oversupplied = skillAnalytics.filter(s => s.gap < 0).slice(0, 6);
    // Emerging (high demand, zero supply)
    const emerging = skillAnalytics.filter(s => s.supply === 0 && s.demand > 0);

    // Languages spoken
    const languageCounts: Record<string, number> = {};
    allProfiles.forEach(p => {
      (p.languages || []).forEach(l => { languageCounts[l] = (languageCounts[l] || 0) + 1; });
    });

    // Learning styles
    const styleCounts: Record<string, number> = {};
    allProfiles.forEach(p => {
      if (p.learningStyle) styleCounts[p.learningStyle] = (styleCounts[p.learningStyle] || 0) + 1;
    });

    // Session stats
    const totalSessions = allSessions.length;
    const totalHours = allSessions.reduce((s, ses) => s + (ses.durationMinutes || 0), 0) / 60;
    const avgRating = allSessions.length
      ? allSessions.reduce((s, ses) => s + (ses.reviewScore || 0), 0) / allSessions.length
      : 0;

    // Match stats
    const activeMatches = allMatches.filter(m => m.status === "active").length;
    const pendingMatches = allMatches.filter(m => m.status === "pending").length;

    return Response.json({
      overview: {
        totalUsers: allUsers.length,
        totalProfiles: allProfiles.length,
        activeMatches,
        pendingMatches,
        totalSessions,
        totalHours: Math.round(totalHours * 10) / 10,
        avgRating: Math.round(avgRating * 10) / 10,
      },
      skillAnalytics,
      inDemand,
      oversupplied,
      emerging,
      languageCounts,
      styleCounts,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
