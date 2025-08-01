import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../../server/storage-vercel';
import { insertVoteSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { voterId, selectedStatement } = req.body;
    
    if (!voterId) {
      return res.status(400).json({ error: 'Voter ID is required' });
    }

    const voteData = insertVoteSchema.parse({
      gameId: id as string,
      selectedStatement,
    });

    const vote = await storage.createVote({ ...voteData, voterId });
    
    // Check if this vote helped the game creator earn points
    const game = await storage.getGame(id as string);
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
}