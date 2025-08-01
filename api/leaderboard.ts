import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../server/storage-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeframe = 'weekly', limit = 10 } = req.query;
    
    const leaderboard = timeframe === 'weekly'
      ? await storage.getWeeklyLeaderboard(Number(limit))
      : await storage.getAllTimeLeaderboard(Number(limit));
    
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}