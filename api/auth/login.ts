import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../../server/storage-vercel';

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
    const { farcasterUsername, farcasterUserId, avatar } = req.body;
    
    console.log('Vercel login attempt:', { farcasterUsername, farcasterUserId });
    
    // Check if user exists
    let user = await storage.getUserByFarcasterId(farcasterUserId);
    
    if (!user) {
      // Create new user with proper default values
      const userData = {
        farcasterUsername,
        farcasterUserId,
        avatar: avatar || null,
        points: 0,
        totalGamesPlayed: 0,
        totalGamesCreated: 0,
        totalCorrectGuesses: 0,
        totalPlayersStumped: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyPoints: 0,
      };
      
      user = await storage.createUser(userData);
      console.log('Created new user in Vercel:', user.id, user.farcasterUsername);
    } else {
      console.log('Found existing user in Vercel:', user.id, user.farcasterUsername);
      // Update avatar if provided
      if (avatar && user.avatar !== avatar) {
        user = await storage.updateUserStats(user.id, { avatar });
      }
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Vercel login error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}