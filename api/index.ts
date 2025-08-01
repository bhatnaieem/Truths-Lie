import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../server/routes';

const app = express();

// CORS middleware for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// JSON parsing middleware
app.use(express.json());

// Session middleware for Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'truth-lie-secret-key-for-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Initialize routes
registerRoutes(app);

// Export for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}