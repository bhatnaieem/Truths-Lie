import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../server/storage-vercel';
import { insertGameSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
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
  } else if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}