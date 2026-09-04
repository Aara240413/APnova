import { db } from "@/db";
import { users, profiles, matches, sessions, messages } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Check if fully seeded (need both users AND profiles)
    const existingUsers = await db.select().from(users).limit(1);
    const existingProfiles = await db.select().from(profiles).limit(1);

    if (existingUsers.length > 0 && existingProfiles.length > 0) {
      return Response.json({ ok: true, message: "Already seeded" });
    }

    // If we have users but no profiles, something went wrong — clean and re-seed
    if (existingUsers.length > 0 && existingProfiles.length === 0) {
      // Clean up partial data
      await db.delete(messages);
      await db.delete(sessions);
      await db.delete(matches);
      await db.delete(profiles);
      await db.delete(users);
    }

    await db.insert(users).values([
      { email: "alice@apnova.io", name: "Alice Chen", avatar: "AC", reputation: 340, streak: 12, badges: ["mentor", "top-rated"], provider: "email", hashedPassword: "demo" },
      { email: "bob@apnova.io", name: "Bob Rivera", avatar: "BR", reputation: 210, streak: 5, badges: ["newcomer"], provider: "email", hashedPassword: "demo" },
      { email: "carla@apnova.io", name: "Carla Okonkwo", avatar: "CO", reputation: 520, streak: 28, badges: ["mentor", "top-rated", "community-leader"], provider: "google" },
      { email: "daniel@apnova.io", name: "Daniel Kim", avatar: "DK", reputation: 180, streak: 3, badges: ["newcomer"], provider: "email", hashedPassword: "demo" },
      { email: "elena@apnova.io", name: "Elena Novak", avatar: "EN", reputation: 430, streak: 15, badges: ["mentor", "streak-master"], provider: "email", hashedPassword: "demo" },
      { email: "fatima@apnova.io", name: "Fatima Al-Hassan", avatar: "FA", reputation: 290, streak: 8, badges: ["peer-champion"], provider: "google" },
    ]);

    // Get the auto-generated IDs
    const allUsers = await db.select().from(users);
    const userByEmail = new Map(allUsers.map(u => [u.email, u.id]));

    const aliceId = userByEmail.get("alice@apnova.io")!;
    const bobId = userByEmail.get("bob@apnova.io")!;
    const carlaId = userByEmail.get("carla@apnova.io")!;
    const danielId = userByEmail.get("daniel@apnova.io")!;
    const elenaId = userByEmail.get("elena@apnova.io")!;
    const fatimaId = userByEmail.get("fatima@apnova.io")!;

    await db.insert(profiles).values([
      { userId: aliceId, teachSkills: ["JavaScript", "React", "UI Design", "Figma"], learnSkills: ["Machine Learning", "Spanish", "Data Visualization"], proficiency: { "JavaScript": 5, "React": 4, "UI Design": 5, "Figma": 4 }, learningStyle: "project-based", languages: ["English", "Mandarin"], weeklyAvailability: { Monday: ["18:00-21:00"], Wednesday: ["18:00-21:00"], Saturday: ["10:00-14:00"] }, goals: "Build AI-powered interactive web applications", timezone: "America/New_York" },
      { userId: bobId, teachSkills: ["Python", "Machine Learning", "Data Science"], learnSkills: ["UI Design", "React", "Data Visualization"], proficiency: { "Python": 5, "Machine Learning": 4, "Data Science": 4 }, learningStyle: "visual", languages: ["English", "Spanish"], weeklyAvailability: { Tuesday: ["10:00-14:00"], Thursday: ["10:00-14:00"], Saturday: ["09:00-12:00"] }, goals: "Build beautiful ML-powered dashboards", timezone: "America/Los_Angeles" },
      { userId: carlaId, teachSkills: ["Spanish", "French", "Data Visualization", "D3.js"], learnSkills: ["JavaScript", "Machine Learning", "Python"], proficiency: { "Spanish": 5, "French": 5, "Data Visualization": 5, "D3.js": 4 }, learningStyle: "interactive", languages: ["English", "Spanish", "French"], weeklyAvailability: { Monday: ["09:00-12:00"], Friday: ["14:00-17:00"], Sunday: ["10:00-13:00"] }, goals: "Create multilingual data visualization tools", timezone: "Europe/London" },
      { userId: danielId, teachSkills: ["TypeScript", "Node.js", "DevOps"], learnSkills: ["Spanish", "UI Design", "D3.js"], proficiency: { "TypeScript": 5, "Node.js": 5, "DevOps": 4 }, learningStyle: "project-based", languages: ["English", "Korean"], weeklyAvailability: { Wednesday: ["19:00-22:00"], Saturday: ["13:00-17:00"] }, goals: "Build full-stack multilingual applications", timezone: "Asia/Tokyo" },
      { userId: elenaId, teachSkills: ["Data Visualization", "R", "Statistics"], learnSkills: ["React", "TypeScript", "Node.js"], proficiency: { "Data Visualization": 5, "R": 5, "Statistics": 5 }, learningStyle: "visual", languages: ["English", "Czech", "German"], weeklyAvailability: { Monday: ["16:00-19:00"], Thursday: ["16:00-19:00"] }, goals: "Create interactive statistical dashboards", timezone: "Europe/Prague" },
      { userId: fatimaId, teachSkills: ["Arabic", "UX Research", "Accessibility"], learnSkills: ["Python", "Machine Learning", "Data Science"], proficiency: { "Arabic": 5, "UX Research": 4, "Accessibility": 5 }, learningStyle: "interactive", languages: ["English", "Arabic", "French"], weeklyAvailability: { Tuesday: ["08:00-11:00"], Saturday: ["09:00-12:00"] }, goals: "Make AI and data products accessible to all", timezone: "Asia/Dubai" },
    ]);

    const [m1] = await db.insert(matches).values([
      { user1: aliceId, user2: bobId, status: "active", compatibilityScore: 92 },
    ]).returning();
    const [m2] = await db.insert(matches).values([
      { user1: aliceId, user2: carlaId, status: "active", compatibilityScore: 78 },
    ]).returning();
    await db.insert(matches).values([
      { user1: bobId, user2: carlaId, status: "pending", compatibilityScore: 85 },
      { user1: danielId, user2: carlaId, status: "active", compatibilityScore: 88 },
      { user1: elenaId, user2: aliceId, status: "pending", compatibilityScore: 74 },
    ]);

    await db.insert(sessions).values([
      { matchId: m1.id, date: new Date("2025-06-01T19:00:00Z"), durationMinutes: 60, notes: "Covered React component patterns and Python ML basics. Great pairing!", reviewScore: 5 },
      { matchId: m1.id, date: new Date("2025-06-08T19:00:00Z"), durationMinutes: 45, notes: "Built a small ML model together. Alice showed React state management.", reviewScore: 4 },
      { matchId: m2.id, date: new Date("2025-06-05T18:30:00Z"), durationMinutes: 50, notes: "Spanish vocabulary for data terms. Carla demonstrated D3 bar charts.", reviewScore: 5 },
    ]);

    await db.insert(messages).values([
      { matchId: m1.id, senderId: aliceId, content: "Hi Bob! Ready for our JS/ML session tomorrow?", language: "en" },
      { matchId: m1.id, senderId: bobId, content: "Absolutely! I prepped a neural network demo in Python.", language: "en" },
      { matchId: m1.id, senderId: aliceId, content: "Perfect — I'll show you React hooks patterns in return!", language: "en" },
      { matchId: m2.id, senderId: carlaId, content: "¡Hola Alice! ¿Estás lista para la sesión de español?", language: "es", translatedContent: "Hi Alice! Are you ready for the Spanish session?" },
      { matchId: m2.id, senderId: aliceId, content: "Sí! Un poco nerviosa pero emocionada 😊", language: "es", translatedContent: "Yes! A little nervous but excited 😊" },
      { matchId: m2.id, senderId: carlaId, content: "¡Excelente! Vamos a practicar vocabulario de datos primero.", language: "es", translatedContent: "Excellent! Let's practice data vocabulary first." },
    ]);

    return Response.json({ ok: true, message: "Seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
