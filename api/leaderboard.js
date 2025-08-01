// Simple leaderboard data
const leaderboardData = [
  { id: '1', farcasterUsername: 'alice.eth', points: 1247, rank: 1, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: '2', farcasterUsername: 'mike.crypto', points: 891, rank: 2, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: '3', farcasterUsername: 'sarah.base', points: 756, rank: 3, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
  { id: '4', farcasterUsername: 'emily.base', points: 423, rank: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: '5', farcasterUsername: 'alex.crypto', points: 247, rank: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
];

module.exports = async function handler(req, res) {
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
    const { timeframe = 'weekly', limit = 10 } = req.query;
    
    // Return the same data for both weekly and all-time for demo
    const leaderboard = leaderboardData.slice(0, parseInt(limit));
    
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};