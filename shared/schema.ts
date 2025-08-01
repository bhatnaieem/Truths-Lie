import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farcasterUsername: text("farcaster_username").notNull().unique(),
  farcasterUserId: text("farcaster_user_id").notNull().unique(),
  avatar: text("avatar"),
  points: integer("points").notNull().default(0),
  totalGamesCreated: integer("total_games_created").notNull().default(0),
  totalGamesPlayed: integer("total_games_played").notNull().default(0),
  totalCorrectGuesses: integer("total_correct_guesses").notNull().default(0),
  totalPlayersStumped: integer("total_players_stumped").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  statements: jsonb("statements").notNull(), // Array of 3 statements
  lieStatement: integer("lie_statement").notNull(), // 1, 2, or 3
  explanation: text("explanation"),
  isActive: boolean("is_active").notNull().default(true),
  allowFriendsOnly: boolean("allow_friends_only").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  voterId: varchar("voter_id").notNull().references(() => users.id),
  selectedStatement: integer("selected_statement").notNull(), // 1, 2, or 3
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'game_created', 'stumped_players', 'earned_badge', 'milestone'
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data like badge name, points earned, etc.
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  farcasterUsername: true,
  farcasterUserId: true,
  avatar: true,
});

export const insertGameSchema = createInsertSchema(games).pick({
  statements: true,
  lieStatement: true,
  explanation: true,
  allowFriendsOnly: true,
}).extend({
  statements: z.array(z.string().min(1).max(280)).length(3),
  lieStatement: z.number().min(1).max(3),
  explanation: z.string().optional(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  gameId: true,
  selectedStatement: true,
}).extend({
  selectedStatement: z.number().min(1).max(3),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  description: true,
  metadata: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Extended types for API responses
export type GameWithCreator = Game & {
  creator: User;
  voteCount: number;
  userVote?: Vote;
  hasVoted: boolean;
  timeRemaining: string;
};

export type GameWithResults = GameWithCreator & {
  votes: Vote[];
  voteCounts: { [key: number]: number };
  correctPercentages: { [key: number]: number };
};

export type LeaderboardEntry = {
  user: User;
  rank: number;
  weeklyPoints: number;
};
