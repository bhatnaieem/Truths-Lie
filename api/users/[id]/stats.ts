import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../../server/storage-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    console.log('Getting stats for user in Vercel:', id);
    const user = await storage.getUser(id as string);
    if (!user) {
      console.log('User not found in Vercel:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    const rank = await storage.getUserRank(id as string, 'weekly');
    const games = await storage.getUserGames(id as string);
    
    const stats = {
      gamesPlayed: user.totalGamesPlayed || 0,
      correctGuesses: user.totalCorrectGuesses || 0,
      stumpedPlayers: user.totalPlayersStumped || 0,
      streak: user.currentStreak || 0,
      points: user.points || 0,
      rank,
      recentGames: games.slice(0, 5),
    };
    
    console.log('Returning stats from Vercel:', stats);
    res.json({ stats });
  } catch (error) {
    console.error('Vercel user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}