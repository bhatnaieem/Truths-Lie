import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../../server/storage-vercel';
import { insertVoteSchema } from '../../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { voterId, selectedStatement } = req.body;
    
    console.log('Vercel vote attempt:', { gameId: id, voterId, selectedStatement });
    
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
    
    console.log('Vercel vote successful:', { voteId: vote.id, isCorrect: vote.isCorrect });
    res.json({ vote });
  } catch (error) {
    console.error('Vercel vote error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  }
}