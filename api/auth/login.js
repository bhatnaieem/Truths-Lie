const { randomUUID } = require('crypto');

// Simple in-memory storage for demo
let users = new Map();
let initialized = false;

function initializeStorage() {
  if (initialized) return;
  
  const demoUsers = [
    { id: 'current-user', farcasterUsername: 'alice.eth', farcasterUserId: '1', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', points: 247 },
    { farcasterUsername: 'mike.crypto', farcasterUserId: '2', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', points: 891 },
    { farcasterUsername: 'sarah.base', farcasterUserId: '3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', points: 756 },
  ];

  demoUsers.forEach(userData => {
    const user = {
      id: userData.id || randomUUID(),
      ...userData,
      avatar: userData.avatar || null,
      totalGamesCreated: Math.floor(Math.random() * 20) + 5,
      totalGamesPlayed: Math.floor(Math.random() * 50) + 10,
      totalCorrectGuesses: Math.floor(Math.random() * 30) + 5,
      totalPlayersStumped: Math.floor(Math.random() * 25) + 3,
      currentStreak: Math.floor(Math.random() * 7) + 1,
      createdAt: new Date(),
    };
    users.set(user.id, user);
  });
  
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initializeStorage();
    
    const { farcasterUsername, farcasterUserId, avatar } = req.body;
    console.log('Vercel login attempt:', { farcasterUsername, farcasterUserId });
    
    // Check if user exists
    let user = Array.from(users.values()).find(u => u.farcasterUserId === farcasterUserId);
    
    if (!user) {
      // Create new user
      const userData = {
        id: randomUUID(),
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
        createdAt: new Date(),
      };
      
      users.set(userData.id, userData);
      user = userData;
      console.log('Created new user in Vercel:', user.id, user.farcasterUsername);
    } else {
      console.log('Found existing user in Vercel:', user.id, user.farcasterUsername);
      // Update avatar if provided
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        users.set(user.id, user);
      }
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Vercel login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};