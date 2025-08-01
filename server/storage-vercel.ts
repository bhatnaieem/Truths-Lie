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

// Global storage for serverless functions
let globalStorage: Map<string, any> | null = null;

function getGlobalStorage() {
  if (!globalStorage) {
    globalStorage = new Map();
    initializeStorage();
  }
  return globalStorage;
}

function initializeStorage() {
  const storage = getGlobalStorage();
  
  if (!storage.has('users')) {
    const users = new Map<string, User>();
    const demoUsers = [
      { id: 'current-user', farcasterUsername: 'alice.eth', farcasterUserId: '1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', points: 247 },
      { farcasterUsername: 'mike.crypto', farcasterUserId: '2', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', points: 891 },
      { farcasterUsername: 'sarah.base', farcasterUserId: '3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', points: 756 },
      { farcasterUsername: 'emily.base', farcasterUserId: '4', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', points: 423 },
      { farcasterUsername: 'alex.crypto', farcasterUserId: '5', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', points: 1247 },
    ];

    demoUsers.forEach(userData => {
      const user: User = {
        id: userData.id || randomUUID(),
        ...userData,
        avatar: userData.avatar || null,
        totalGamesCreated: Math.floor(Math.random() * 20) + 5,
        totalGamesPlayed: Math.floor(Math.random() * 50) + 10,
        totalCorrectGuesses: Math.floor(Math.random() * 30) + 5,
        totalPlayersStumped: Math.floor(Math.random() * 25) + 3,
        currentStreak: Math.floor(Math.random() * 7) + 1,
        createdAt: new Date(),
      };
      users.set(user.id, user);
    });
    
    storage.set('users', users);
    
    // Add demo games
    const games = new Map<string, Game>();
    const userIds = Array.from(users.keys());
    const demoGames = [
      {
        id: "demo-game-1",
        creatorId: userIds[1], // mike.crypto
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
        creatorId: userIds[2], // sarah.base
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
        creatorId: userIds[3], // emily.base
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
      };
      games.set(game.id, game);
    });
    
    storage.set('games', games);
    storage.set('votes', new Map<string, Vote>());
    storage.set('activities', new Map<string, Activity>());
  }
}

export class VercelStorage {
  private getUsers(): Map<string, User> {
    return getGlobalStorage().get('users') || new Map();
  }
  
  private getGames(): Map<string, Game> {
    return getGlobalStorage().get('games') || new Map();
  }
  
  private getVotes(): Map<string, Vote> {
    return getGlobalStorage().get('votes') || new Map();
  }
  
  private getActivities(): Map<string, Activity> {
    return getGlobalStorage().get('activities') || new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.getUsers().get(id);
  }

  async getUserByFarcasterUsername(username: string): Promise<User | undefined> {
    return Array.from(this.getUsers().values()).find(user => user.farcasterUsername === username);
  }

  async getUserByFarcasterId(farcasterUserId: string): Promise<User | undefined> {
    return Array.from(this.getUsers().values()).find(user => user.farcasterUserId === farcasterUserId);
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
    this.getUsers().set(user.id, user);
    return user;
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User> {
    const user = this.getUsers().get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, points: user.points + pointsToAdd };
    this.getUsers().set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserStats(userId: string, stats: Partial<User>): Promise<User> {
    const user = this.getUsers().get(userId);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...stats };
    this.getUsers().set(userId, updatedUser);
    return updatedUser;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.getGames().get(id);
  }

  async getGameWithCreator(id: string, viewerId?: string): Promise<GameWithCreator | undefined> {
    const game = this.getGames().get(id);
    if (!game) return undefined;

    const creator = this.getUsers().get(game.creatorId);
    if (!creator) return undefined;

    const votes = Array.from(this.getVotes().values()).filter(vote => vote.gameId === id);
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

  async getActiveGames(limit = 10, friendsOnly = false, userId?: string): Promise<GameWithCreator[]> {
    const activeGames = Array.from(this.getGames().values())
      .filter(game => game.isActive && new Date(game.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const gamesWithCreators = await Promise.all(
      activeGames.map(game => this.getGameWithCreator(game.id, userId))
    );

    return gamesWithCreators.filter((game): game is GameWithCreator => game !== undefined);
  }

  async getUserGames(userId: string): Promise<GameWithCreator[]> {
    const userGames = Array.from(this.getGames().values())
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
      allowFriendsOnly: gameData.allowFriendsOnly ?? false,
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
    };
    this.getGames().set(game.id, game);

    // Update creator stats
    const creator = this.getUsers().get(gameData.creatorId);
    if (creator) {
      await this.updateUserStats(gameData.creatorId, {
        totalGamesCreated: creator.totalGamesCreated + 1
      });
    }

    return game;
  }

  async getVote(gameId: string, voterId: string): Promise<Vote | undefined> {
    return Array.from(this.getVotes().values()).find(
      vote => vote.gameId === gameId && vote.voterId === voterId
    );
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
    this.getVotes().set(vote.id, vote);

    // Update voter stats and points
    const voter = this.getUsers().get(voteData.voterId);
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

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      id: randomUUID(),
      ...activity,
      metadata: activity.metadata || null,
      createdAt: new Date(),
    };
    this.getActivities().set(newActivity.id, newActivity);
    return newActivity;
  }

  async getRecentActivities(limit = 10): Promise<(Activity & { user: User })[]> {
    const activities = Array.from(this.getActivities().values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return activities.map(activity => {
      const user = this.getUsers().get(activity.userId);
      return { ...activity, user: user! };
    }).filter(activity => activity.user);
  }

  async getWeeklyLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    // For simplicity, using total points as weekly points
    const users = Array.from(this.getUsers().values())
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return users.map((user, index) => ({
      user,
      rank: index + 1,
      weeklyPoints: Math.floor(user.points * 0.3), // Simulate weekly points
    }));
  }

  async getAllTimeLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const users = Array.from(this.getUsers().values())
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

  async getGameWithResults(id: string): Promise<GameWithResults | undefined> {
    const game = await this.getGameWithCreator(id);
    if (!game) return undefined;

    const votes = Array.from(this.getVotes().values()).filter(vote => vote.gameId === id);
    const statementCounts = [0, 0, 0];
    votes.forEach(vote => {
      if (vote.selectedStatement >= 1 && vote.selectedStatement <= 3) {
        statementCounts[vote.selectedStatement - 1]++;
      }
    });

    const voteCounts: { [key: number]: number } = {
      [1]: statementCounts[0],
      [2]: statementCounts[1], 
      [3]: statementCounts[2],
    };

    const correctPercentages: { [key: number]: number } = {};
    if (votes.length > 0) {
      correctPercentages[1] = statementCounts[0] / votes.length * 100;
      correctPercentages[2] = statementCounts[1] / votes.length * 100;
      correctPercentages[3] = statementCounts[2] / votes.length * 100;
    }

    return {
      ...game,
      votes,
      voteCounts,
      correctPercentages,
    };
  }

  async getUserActivities(userId: string, limit = 10): Promise<(Activity & { user: User })[]> {
    const activities = Array.from(this.getActivities().values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return activities.map(activity => {
      const user = this.getUsers().get(activity.userId);
      return { ...activity, user: user! };
    }).filter(activity => activity.user);
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

export const vercelStorage = new VercelStorage();