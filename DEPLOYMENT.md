# Truth Lie - Vercel Deployment Guide

## Overview
Truth Lie is now ready for deployment on Vercel with serverless functions and optimized for the Farcaster ecosystem.

## Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" and import your repository
3. Vercel will automatically detect the settings from `vercel.json`

### 2. Environment Variables (Optional)
If you want to add environment variables later:
- `SESSION_SECRET` - Custom session secret (optional, defaults to development key)
- `NODE_ENV` - Automatically set to "production" by Vercel

### 3. Deploy
1. Click "Deploy" - Vercel will build and deploy automatically
2. Your app will be available at `https://your-project-name.vercel.app`

## What's Included

### ✅ Production-Ready Features
- **Serverless Functions**: All API routes configured for Vercel
- **Static Assets**: Frontend optimized and served from CDN
- **In-Memory Storage**: Fast, reliable data storage for demo
- **Farcaster Integration**: Frame meta tags and social sharing
- **Mobile Optimized**: Responsive design for all devices

### ✅ Farcaster Features
- Frame meta tags for social sharing
- Optimized Open Graph images
- Farcaster username highlighting
- Community-focused branding
- Share buttons for Warpcast

### ✅ Game Features
- 3 active demo games for immediate testing
- Real-time voting and results
- Leaderboard with weekly/all-time rankings
- User instructions and onboarding
- About section with creator attribution

## Technical Details

### Build Configuration
- **Frontend**: Built with Vite, served as static files
- **Backend**: Serverless functions using @vercel/node
- **Routing**: SPA routing with fallback to index.html
- **CORS**: Configured for production deployment

### Performance Optimizations
- Static asset caching via Vercel CDN
- Serverless function cold start optimization
- In-memory storage for fast data access
- Optimized bundle sizes

## Post-Deployment

### Testing
1. Visit your deployed URL
2. Test voting on demo games
3. Check Farcaster sharing functionality
4. Verify leaderboard displays correctly

### Customization
- Update creator attribution in About section
- Add your own demo games
- Customize Farcaster sharing messages
- Modify branding colors and styling

## Free Tier Friendly
- No database required
- Serverless functions within free limits
- Static hosting included
- Perfect for MVP and demo purposes

Your Truth Lie app is now production-ready and optimized for the Farcaster community!