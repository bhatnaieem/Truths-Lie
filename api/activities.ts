import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage as storage } from '../server/storage-vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 10 } = req.query;
    const activities = await storage.getRecentActivities(Number(limit));
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}