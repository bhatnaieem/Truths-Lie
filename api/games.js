const { randomUUID } = require('crypto');

// Simple in-memory storage
let games = new Map();
let initialized = false;

function initializeGames() {
  if (initialized) return;
  
  const demoGames = [
    {
      id: "demo-game-1",
      creatorId: "user-2",
      statements: [
        "I once ate 50 chicken nuggets in one sitting",
        "I have a pet tarantula named Fred", 
        "I can speak fluent Japanese"
      ],
      lieStatement: 2,
      explanation: "I actually don't have any pets! I'm allergic to most animals.",
      isActive: true,
      allowFriendsOnly: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "demo-game-2", 
      creatorId: "user-3",
      statements: [
        "I met my partner on a dating app",
        "I've never broken a bone in my body",
        "I once won a hot dog eating contest"
      ],
      lieStatement: 1,
      explanation: "I actually broke my arm falling off my bike when I was 12!",
      isActive: true,
      allowFriendsOnly: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    }
  ];

  demoGames.forEach(game => games.set(game.id, game));
  initialized = true;
}

module.exports = async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  initializeGames();

  if (req.method === 'GET') {
    try {
      const activeGames = Array.from(games.values())
        .filter(game => game.isActive && new Date(game.expiresAt) > new Date())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.json({ games: activeGames });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { creatorId, statements, lieStatement, explanation, allowFriendsOnly } = req.body;
      
      if (!creatorId || !statements || statements.length !== 3 || lieStatement === undefined) {
        return res.status(400).json({ error: 'Invalid game data' });
      }

      const game = {
        id: randomUUID(),
        creatorId,
        statements,
        lieStatement,
        explanation: explanation || '',
        isActive: true,
        allowFriendsOnly: allowFriendsOnly || false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
      };

      games.set(game.id, game);
      res.json({ game });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Invalid request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};