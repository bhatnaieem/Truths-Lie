import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../../server/storage-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const user = await storage.getUser(id as string);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rank = await storage.getUserRank(id as string, 'weekly');
    const games = await storage.getUserGames(id as string);
    
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
}