import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user1 = searchParams.get("user1");
  const user2 = searchParams.get("user2");

  if (!user1 || !user2) return Response.json({ error: "user1 and user2 required" }, { status: 400 });

  const [p1] = await db.select().from(profiles).where(eq(profiles.userId, Number(user1)));
  const [p2] = await db.select().from(profiles).where(eq(profiles.userId, Number(user2)));

  if (!p1 || !p2) return Response.json({ error: "Profiles not found" }, { status: 404 });

  // AI-generated curriculum based on matched skills
  const u1Teaches = p1.teachSkills || [];
  const u1Learns = p1.learnSkills || [];
  const u2Teaches = p2.teachSkills || [];
  const u2Learns = p2.learnSkills || [];

  const u1CanTeachU2 = u1Teaches.filter(s => u2Learns.includes(s));
  const u2CanTeachU1 = u2Teaches.filter(s => u1Learns.includes(s));

  const allSkills = [...u1CanTeachU2, ...u2CanTeachU1];
  const primarySkill1 = u1CanTeachU2[0] || u1Teaches[0] || "Skill A";
  const primarySkill2 = u2CanTeachU1[0] || u2Teaches[0] || "Skill B";

  const roadmap = {
    title: `${primarySkill1} ↔ ${primarySkill2} Exchange`,
    duration: "4 weeks",
    weeks: [
      {
        week: 1,
        title: "Foundation & Assessment",
        topics: [
          `Introduction to ${primarySkill1}: core concepts and terminology`,
          `Introduction to ${primarySkill2}: foundational principles`,
          "Mutual skill assessment and learning goal alignment",
          "Set up shared workspace and communication cadence",
        ],
        project: `Create a shared glossary document covering key terms from both ${primarySkill1} and ${primarySkill2}`,
        hours: 4,
      },
      {
        week: 2,
        title: "Deep Dive & Practice",
        topics: [
          `${primarySkill1}: intermediate patterns and best practices`,
          `${primarySkill2}: hands-on exercises and real-world applications`,
          "Peer teaching sessions with Q&A",
          "Document learnings and create quick-reference guides",
        ],
        project: `Build a mini-project that combines ${primarySkill1} concepts with ${primarySkill2} techniques`,
        hours: 5,
      },
      {
        week: 3,
        title: "Collaborative Building",
        topics: [
          `Advanced ${primarySkill1}: edge cases and optimization`,
          `Advanced ${primarySkill2}: production-ready approaches`,
          "Collaborative code review and feedback exchange",
          "Integration patterns between both skill areas",
        ],
        project: `Develop a functional prototype that showcases both ${primarySkill1} and ${primarySkill2} in a real-world scenario`,
        hours: 6,
      },
      {
        week: 4,
        title: "Review & Next Steps",
        topics: [
          "Final project presentation and peer review",
          "Skills gap assessment: what was mastered, what needs more work",
          "Create personal learning roadmaps for continued growth",
          "Exchange recommendations and resources for self-study",
        ],
        project: `Polish and present the collaborative project. Write mutual skill endorsements and plan next exchange cycle.`,
        hours: 4,
      },
    ],
    suggestedMeetingTimes: generateMeetingTimes(p1.weeklyAvailability as Record<string, string[]>, p2.weeklyAvailability as Record<string, string[]>, p1.timezone || "UTC", p2.timezone || "UTC"),
    projectIdeas: [
      `Interactive ${primarySkill2} dashboard built with ${primarySkill1} techniques`,
      `Automated workflow combining ${primarySkill1} and ${primarySkill2} best practices`,
      `Open-source tool that teaches ${primarySkill1} concepts using ${primarySkill2} examples`,
    ],
  };

  return Response.json({ roadmap });
}

function generateMeetingTimes(avail1: Record<string, string[]>, avail2: Record<string, string[]>, tz1: string, tz2: string) {
  const days1 = Object.keys(avail1 || {});
  const days2 = Object.keys(avail2 || {});
  const commonDays = days1.filter(d => days2.includes(d));

  if (commonDays.length > 0) {
    return commonDays.map(day => ({
      day,
      time: (avail1[day]?.[0] || "18:00-20:00"),
      note: `Both available — ${tz1} / ${tz2}`,
    }));
  }

  // No overlap — suggest compromise
  return [
    { day: "Saturday", time: "10:00-12:00", note: `Suggested compromise between ${tz1} and ${tz2}` },
    { day: "Sunday", time: "14:00-16:00", note: `Alternative weekend slot` },
  ];
}
