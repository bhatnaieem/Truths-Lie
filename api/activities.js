// Sample activity data
const activities = [
  {
    id: '1',
    userId: 'user-1',
    type: 'correct_guess',
    description: 'Correctly identified the lie in "My Travel Adventures"',
    metadata: { gameId: 'demo-game-1', points: 5 },
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '2', 
    userId: 'user-2',
    type: 'game_created',
    description: 'Created a new truth or lie game',
    metadata: { gameId: 'demo-game-2' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    userId: 'user-3',
    type: 'stumped_player',
    description: 'Successfully stumped 3 players with their lie',
    metadata: { gameId: 'demo-game-3', points: 6 },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  }
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
    const { limit = 10 } = req.query;
    const recentActivities = activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));
    
    res.json({ activities: recentActivities });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};