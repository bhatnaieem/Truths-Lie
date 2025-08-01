import type { Express } from "express";
import { createServer, type Server } from "http";
import { vercelStorage as storage } from "./storage-vercel";
import { insertGameSchema, insertVoteSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export function createRouter() {
  const router = require('express').Router();

  return router;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication and profile
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { farcasterUsername, farcasterUserId, avatar } = req.body;
      
      // Check if user exists
      let user = await storage.getUserByFarcasterId(farcasterUserId);
      
      if (!user) {
        // Create new user
        const userData = insertUserSchema.parse({
          farcasterUsername,
          farcasterUserId,
          avatar,
        });
        user = await storage.createUser(userData);
      }
      
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const rank = await storage.getUserRank(req.params.id, 'weekly');
      const games = await storage.getUserGames(req.params.id);
      
      res.json({
        stats: {
          gamesPlayed: user.totalGamesPlayed,
          correctGuesses: user.totalCorrectGuesses,
          stumpedPlayers: user.totalPlayersStumped,
          streak: user.currentStreak,
          points: user.points,
          rank,
          recentGames: games.slice(0, 5),
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Current user endpoint - essential for the frontend
  app.get("/api/users/current-user/stats", async (req, res) => {
    try {
      // Use demo user for deployment
      const currentUserId = 'current-user';
      const user = await storage.getUser(currentUserId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const rank = await storage.getUserRank(currentUserId, 'weekly');
      const games = await storage.getUserGames(currentUserId);
      
      res.json({
        stats: {
          gamesPlayed: user.totalGamesPlayed,
          correctGuesses: user.totalCorrectGuesses,
          stumpedPlayers: user.totalPlayersStumped,
          streak: user.currentStreak,
          points: user.points,
          rank,
          recentGames: games.slice(0, 5),
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Games
  app.get("/api/games", async (req, res) => {
    try {
      const { limit = 10, friendsOnly = false, userId } = req.query;
      const games = await storage.getActiveGames(
        Number(limit),
        friendsOnly === 'true',
        userId as string
      );
      res.json({ games });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const { userId } = req.query;
      const game = await storage.getGameWithCreator(req.params.id, userId as string);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json({ game });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/games/:id/results", async (req, res) => {
    try {
      const game = await storage.getGameWithResults(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      
      // Only show results if game is expired or user has voted
      if (game.isActive && new Date(game.expiresAt) > new Date()) {
        return res.status(403).json({ error: 'Game is still active' });
      }
      
      res.json({ game });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const { creatorId, ...gameData } = req.body;
      
      if (!creatorId) {
        return res.status(400).json({ error: 'Creator ID is required' });
      }

      const validatedData = insertGameSchema.parse(gameData);
      const game = await storage.createGame({ ...validatedData, creatorId });
      
      // Create activity
      await storage.createActivity({
        userId: creatorId,
        type: 'game_created',
        description: 'Created a new truth or lie game',
        metadata: { gameId: game.id },
      });
      
      res.json({ game });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  app.post("/api/games/:id/vote", async (req, res) => {
    try {
      const { voterId, selectedStatement } = req.body;
      
      if (!voterId) {
        return res.status(400).json({ error: 'Voter ID is required' });
      }

      const voteData = insertVoteSchema.parse({
        gameId: req.params.id,
        selectedStatement,
      });

      const vote = await storage.createVote({ ...voteData, voterId });
      
      // Check if this vote helped the game creator earn points
      const game = await storage.getGame(req.params.id);
      if (game && !vote.isCorrect) {
        // Voter was wrong, creator gets points
        await storage.updateUserPoints(game.creatorId, 2);
        
        const creator = await storage.getUser(game.creatorId);
        if (creator) {
          await storage.updateUserStats(game.creatorId, {
            totalPlayersStumped: creator.totalPlayersStumped + 1,
          });
        }
      }
      
      res.json({ vote });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Leaderboards
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { timeframe = 'weekly', limit = 10 } = req.query;
      
      const leaderboard = timeframe === 'weekly'
        ? await storage.getWeeklyLeaderboard(Number(limit))
        : await storage.getAllTimeLeaderboard(Number(limit));
      
      res.json({ leaderboard });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const activities = await storage.getRecentActivities(Number(limit));
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/users/:id/activities", async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const activities = await storage.getUserActivities(req.params.id, Number(limit));
      res.json({ activities });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
