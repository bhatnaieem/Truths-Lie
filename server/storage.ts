import { 
  type User, 
  type InsertUser, 
  type Game, 
  type InsertGame, 
  type Vote, 
  type InsertVote, 
  type Activity, 
  type InsertActivity,
  type GameWithCreator,
  type GameWithResults,
  type LeaderboardEntry
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFarcasterUsername(username: string): Promise<User | undefined>;
  getUserByFarcasterId(farcasterUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, pointsToAdd: number): Promise<User>;
  updateUserStats(userId: string, stats: Partial<User>): Promise<User>;

  // Games
  getGame(id: string): Promise<Game | undefined>;
  getGameWithCreator(id: string, viewerId?: string): Promise<GameWithCreator | undefined>;
  getGameWithResults(id: string): Promise<GameWithResults | undefined>;
  getActiveGames(limit?: number, friendsOnly?: boolean, userId?: string): Promise<GameWithCreator[]>;
  getUserGames(userId: string): Promise<GameWithCreator[]>;
  createGame(game: InsertGame & { creatorId: string }): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game>;
  expireGame(id: string): Promise<Game>;

  // Votes
  getVote(gameId: string, voterId: string): Promise<Vote | undefined>;
  getGameVotes(gameId: string): Promise<Vote[]>;
  createVote(vote: InsertVote & { voterId: string }): Promise<Vote>;
  getVoteCountsByStatement(gameId: string): Promise<{ [key: number]: number }>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<(Activity & { user: User })[]>;

  // Leaderboards
  getWeeklyLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getAllTimeLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: string, timeframe: 'weekly' | 'all-time'): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private games: Map<string, Game> = new Map();
  private votes: Map<string, Vote> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo users
    const demoUsers = [
      { farcasterUsername: 'alice.eth', farcasterUserId: '1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', points: 247 },
      { farcasterUsername: 'mike.crypto', farcasterUserId: '2', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', points: 891 },
      { farcasterUsername: 'sarah.base', farcasterUserId: '3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', points: 756 },
      { farcasterUsername: 'emily.base', farcasterUserId: '4', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', points: 423 },
      { farcasterUsername: 'alex.crypto', farcasterUserId: '5', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', points: 1247 },
    ];

    demoUsers.forEach(userData => {
      const user: User = {
        id: randomUUID(),
        ...userData,
        totalGamesCreated: Math.floor(Math.random() * 20) + 5,
        totalGamesPlayed: Math.floor(Math.random() * 50) + 10,
        totalCorrectGuesses: Math.floor(Math.random() * 30) + 5,
        totalPlayersStumped: Math.floor(Math.random() * 25) + 3,
        currentStreak: Math.floor(Math.random() * 7) + 1,
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });

    // Add demo games
    const userIds = Array.from(this.users.keys());
    const demoGames = [
      {
        id: "demo-game-1",
        creatorId: userIds[0],
        statements: [
          "I once ate 50 chicken nuggets in one sitting",
          "I have a pet tarantula named Fred", 
          "I can speak fluent Japanese"
        ],
        lieStatement: 2,
        explanation: "I actually don't have any pets! I'm allergic to most animals.",
        isActive: true,
        allowFriendsOnly: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "demo-game-2",
        creatorId: userIds[1], 
        statements: [
          "I've been to 15 different countries",
          "I was born with an extra toe",
          "I once met a celebrity at a coffee shop"
        ],
        lieStatement: 1,
        explanation: "I've actually only been to 3 countries - the US, Canada, and Mexico!",
        isActive: true,
        allowFriendsOnly: false,
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: "demo-game-3",
        creatorId: userIds[2],
        statements: [
          "I can solve a Rubik's cube in under 30 seconds",
          "I once accidentally dyed my hair green", 
          "I have a collection of over 100 rubber ducks"
        ],
        lieStatement: 3,
        explanation: "I only have about 20 rubber ducks, not 100! But they're still pretty cool.",
        isActive: true,
        allowFriendsOnly: false,
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      }
    ];

    demoGames.forEach(gameData => {
      const game: Game = {
        ...gameData,
        explanation: gameData.explanation || null,
        allowFriendsOnly: gameData.allowFriendsOnly || false,
      };
      this.games.set(game.id, game);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFarcasterUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.farcasterUsername === username);
  }

  async getUserByFarcasterId(farcasterUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.farcasterUserId === farcasterUserId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      ...insertUser,
      avatar: insertUser.avatar || null,
      points: 0,
      totalGamesCreated: 0,
      totalGamesPlayed: 0,
      totalCorrectGuesses: 0,
      totalPlayersStumped: 0,
      currentStreak: 0,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, points: user.points + pointsToAdd };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStats(userId: string, stats: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...stats };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Games
  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameWithCreator(id: string, viewerId?: string): Promise<GameWithCreator | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    const creator = this.users.get(game.creatorId);
    if (!creator) return undefined;

    const votes = Array.from(this.votes.values()).filter(vote => vote.gameId === id);
    const userVote = viewerId ? votes.find(vote => vote.voterId === viewerId) : undefined;
    
    const timeRemaining = this.calculateTimeRemaining(game.expiresAt);
    
    return {
      ...game,
      creator,
      voteCount: votes.length,
      userVote,
      hasVoted: !!userVote,
      timeRemaining,
    };
  }

  async getGameWithResults(id: string): Promise<GameWithResults | undefined> {
    const gameWithCreator = await this.getGameWithCreator(id);
    if (!gameWithCreator) return undefined;

    const votes = Array.from(this.votes.values()).filter(vote => vote.gameId === id);
    const voteCounts = await this.getVoteCountsByStatement(id);
    
    const correctPercentages: { [key: number]: number } = {};
    for (let i = 1; i <= 3; i++) {
      const totalVotes = votes.length;
      const correctVotes = votes.filter(vote => 
        vote.selectedStatement === gameWithCreator.lieStatement && vote.selectedStatement === i
      ).length;
      correctPercentages[i] = totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0;
    }

    return {
      ...gameWithCreator,
      votes,
      voteCounts,
      correctPercentages,
    };
  }

  async getActiveGames(limit = 10, friendsOnly = false, userId?: string): Promise<GameWithCreator[]> {
    const activeGames = Array.from(this.games.values())
      .filter(game => game.isActive && new Date(game.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const gamesWithCreators = await Promise.all(
      activeGames.map(game => this.getGameWithCreator(game.id, userId))
    );

    return gamesWithCreators.filter((game): game is GameWithCreator => game !== undefined);
  }

  async getUserGames(userId: string): Promise<GameWithCreator[]> {
    const userGames = Array.from(this.games.values())
      .filter(game => game.creatorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const gamesWithCreators = await Promise.all(
      userGames.map(game => this.getGameWithCreator(game.id, userId))
    );

    return gamesWithCreators.filter((game): game is GameWithCreator => game !== undefined);
  }

  async createGame(gameData: InsertGame & { creatorId: string }): Promise<Game> {
    const game: Game = {
      id: randomUUID(),
      ...gameData,
      explanation: gameData.explanation || null,
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
    };
    this.games.set(game.id, game);

    // Update creator stats
    const creator = this.users.get(gameData.creatorId);
    if (creator) {
      await this.updateUserStats(gameData.creatorId, {
        totalGamesCreated: creator.totalGamesCreated + 1
      });
    }

    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    const game = this.games.get(id);
    if (!game) throw new Error('Game not found');
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async expireGame(id: string): Promise<Game> {
    return this.updateGame(id, { isActive: false });
  }

  // Votes
  async getVote(gameId: string, voterId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      vote => vote.gameId === gameId && vote.voterId === voterId
    );
  }

  async getGameVotes(gameId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.gameId === gameId);
  }

  async createVote(voteData: InsertVote & { voterId: string }): Promise<Vote> {
    // Check if user already voted
    const existingVote = await this.getVote(voteData.gameId, voteData.voterId);
    if (existingVote) {
      throw new Error('User has already voted on this game');
    }

    const game = await this.getGame(voteData.gameId);
    if (!game) throw new Error('Game not found');

    const isCorrect = voteData.selectedStatement === game.lieStatement;

    const vote: Vote = {
      id: randomUUID(),
      ...voteData,
      isCorrect,
      createdAt: new Date(),
    };
    this.votes.set(vote.id, vote);

    // Update voter stats and points
    const voter = this.users.get(voteData.voterId);
    if (voter) {
      const pointsEarned = isCorrect ? 1 : 0;
      await this.updateUserPoints(voteData.voterId, pointsEarned);
      await this.updateUserStats(voteData.voterId, {
        totalGamesPlayed: voter.totalGamesPlayed + 1,
        totalCorrectGuesses: voter.totalCorrectGuesses + (isCorrect ? 1 : 0),
        currentStreak: isCorrect ? voter.currentStreak + 1 : 0,
      });
    }

    return vote;
  }

  async getVoteCountsByStatement(gameId: string): Promise<{ [key: number]: number }> {
    const votes = await this.getGameVotes(gameId);
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
    
    votes.forEach(vote => {
      counts[vote.selectedStatement] = (counts[vote.selectedStatement] || 0) + 1;
    });

    return counts;
  }

  // Activities
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      id: randomUUID(),
      ...activity,
      metadata: activity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(newActivity.id, newActivity);
    return newActivity;
  }

  async getUserActivities(userId: string, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getRecentActivities(limit = 10): Promise<(Activity & { user: User })[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return activities.map(activity => {
      const user = this.users.get(activity.userId);
      return { ...activity, user: user! };
    }).filter(activity => activity.user);
  }

  // Leaderboards
  async getWeeklyLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    // For simplicity, using total points as weekly points
    const users = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return users.map((user, index) => ({
      user,
      rank: index + 1,
      weeklyPoints: Math.floor(user.points * 0.3), // Simulate weekly points
    }));
  }

  async getAllTimeLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const users = Array.from(this.users.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return users.map((user, index) => ({
      user,
      rank: index + 1,
      weeklyPoints: user.points,
    }));
  }

  async getUserRank(userId: string, timeframe: 'weekly' | 'all-time'): Promise<number> {
    const leaderboard = timeframe === 'weekly' 
      ? await this.getWeeklyLeaderboard(100)
      : await this.getAllTimeLeaderboard(100);
    
    const userEntry = leaderboard.find(entry => entry.user.id === userId);
    return userEntry?.rank || 0;
  }

  private calculateTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  }
}

export const storage = new MemStorage();
