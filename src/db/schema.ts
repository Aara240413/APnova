import { pgTable, serial, text, integer, timestamp, boolean, jsonb, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: text("name"),
  avatar: text("avatar"),
  provider: text("provider").default("email"),
  hashedPassword: text("hashed_password"),
  role: text("role").default("user"),
  reputation: integer("reputation").default(0),
  streak: integer("streak").default(0),
  badges: jsonb("badges").default([]),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  teachSkills: text("teach_skills").array(),
  learnSkills: text("learn_skills").array(),
  proficiency: jsonb("proficiency").default({}),
  learningStyle: text("learning_style"),
  languages: text("languages").array(),
  weeklyAvailability: jsonb("weekly_availability").default({}),
  goals: text("goals"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1: integer("user1").references(() => users.id),
  user2: integer("user2").references(() => users.id),
  status: text("status").default("pending"), // matched, active, completed
  compatibilityScore: integer("compatibility_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  senderId: integer("sender_id").references(() => users.id),
  content: text("content"),
  translatedContent: text("translated_content"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  date: timestamp("date"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  reviewScore: integer("review_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id),
  title: text("title"),
  content: jsonb("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  reportDate: timestamp("report_date").defaultNow(),
  data: jsonb("data"),
});
