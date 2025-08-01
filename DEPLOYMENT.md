# TruthLie - Vercel Deployment Guide

## Overview
This guide will help you deploy the TruthLie game to Vercel for free hosting. The app has been configured with serverless functions to work seamlessly on Vercel's platform.

## Prerequisites
- A Vercel account (free)
- GitHub account for code hosting
- Node.js installed locally (for testing)

## Deployment Steps

### 1. Prepare Your Repository
1. Create a new GitHub repository
2. Push this code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TruthLie game"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

### 3. Environment Configuration
The app uses in-memory storage with demo data, so no database setup is required for the free deployment.

### 4. Custom Domain (Optional)
- Vercel provides a free `.vercel.app` domain
- You can add a custom domain in the project settings if you have one

## Project Structure for Vercel

```
├── api/                    # Serverless API routes
│   ├── auth/
│   │   └── login.ts       # User authentication
│   ├── games/
│   │   ├── index.ts       # Game CRUD operations
│   │   └── [id]/
│   │       └── vote.ts    # Voting functionality
│   ├── users/
│   │   ├── [id].ts        # User profiles
│   │   └── [id]/
│   │       └── stats.ts   # User statistics
│   ├── activities.ts      # Activity feed
│   └── leaderboard.ts     # Leaderboards
├── client/                # React frontend
│   ├── src/
│   └── dist/             # Build output (generated)
├── server/               # Server utilities
│   └── storage-vercel.ts # In-memory storage for serverless
├── shared/               # Shared types and schemas
└── vercel.json          # Vercel configuration
```

## Features Included

### Core Gameplay
- ✅ Create games with 3 statements (2 truths, 1 lie)
- ✅ Vote on active games
- ✅ Points system (1 point for correct guess, 2 points for fooling others)
- ✅ Time-limited games (24 hour expiration)

### Social Features
- ✅ User profiles with avatars
- ✅ Activity feed showing recent games and achievements
- ✅ Weekly and all-time leaderboards
- ✅ User statistics and streaks

### Technical Features
- ✅ Responsive design (mobile and desktop)
- ✅ Real-time updates with React Query
- ✅ Serverless architecture
- ✅ In-memory storage with demo data
- ✅ Error handling and loading states

## Demo Data
The app comes with 5 demo users and sample data to showcase the functionality:
- alice.eth (247 points)
- mike.crypto (891 points) 
- sarah.base (756 points)
- emily.base (423 points)
- alex.crypto (1,247 points)

## Scaling Options
For production use with real users:
1. **Database**: Replace in-memory storage with Vercel Postgres or Supabase
2. **Authentication**: Integrate with Farcaster's real authentication system
3. **Real-time**: Add WebSocket support for live voting updates
4. **Analytics**: Add user tracking and game analytics

## Support
- Check the Vercel deployment logs if issues occur
- Ensure all API routes are working by testing the endpoints
- The app should work immediately with demo data

## Live Demo
Once deployed, your app will be available at: `https://your-project-name.vercel.app`

Test the deployment by:
1. Creating a new game (as a demo user)
2. Voting on existing games
3. Checking the leaderboard
4. Viewing user statistics