import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../server/storage-vercel';
import { insertUserSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}