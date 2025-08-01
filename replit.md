# TruthLie Game Platform

## Overview

TruthLie is a social gaming platform that combines elements of deception and intuition in an engaging "Two Truths and a Lie" format. Players create games with three statements (two true, one false) and challenge others to identify the lie. The platform integrates with Farcaster for social authentication and features a competitive scoring system with leaderboards, streaks, and activity tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom design tokens and dark mode support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging middleware
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Farcaster-based social authentication system

### Database Design
- **Database**: PostgreSQL with Neon as the serverless provider
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Core Tables**:
  - Users: Farcaster integration, points, stats, streaks
  - Games: Statements array, lie indicator, expiration logic
  - Votes: Player responses with correctness tracking
  - Activities: Gamification events and social feed

### Data Storage Strategy
- **Primary Storage**: PostgreSQL for all persistent data
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **File Storage**: Static assets served through Vite in development, build output for production

### Authentication & Authorization
- **Social Login**: Farcaster username and user ID based authentication
- **Session Management**: Express sessions with PostgreSQL storage
- **User Context**: Mock user system for development with real Farcaster integration planned

### Game Logic & Mechanics
- **Game Creation**: Players submit three statements with one designated as false
- **Voting System**: Time-limited voting on active games with immediate correctness feedback
- **Scoring Algorithm**: Points awarded for correct guesses and successful deception
- **Leaderboards**: Weekly and all-time rankings with user positioning

### Real-time Features
- **Activity Feed**: Recent game creation, successful deceptions, and achievement unlocks
- **Live Updates**: React Query automatic refetching for dynamic content updates
- **Game Expiration**: Time-based game lifecycle management

## Recent Changes (January 2025)

### Farcaster Sharing Integration
- **Date**: January 1, 2025
- **Feature**: Added comprehensive Farcaster sharing for game results
- **Components Added**: 
  - `FarcasterShare` component for generating shareable content
  - Share buttons integrated into game cards and detail pages
  - Automatic share text generation showing correct/incorrect guesses
  - Warpcast integration with direct posting capabilities
- **User Experience**: Players can now share their results on Farcaster with custom formatted text showing their performance and the game statements

### User Experience Enhancements
- **Date**: August 1, 2025
- **Navigation Updates**: Replaced refresh button with About section in bottom navigation
- **About Modal**: Added comprehensive about section with:
  - Game explanation and how-to-play instructions
  - Creator attribution to deathnotes.eth
  - Direct link to follow @deathnotes.eth on Farcaster
- **User Instructions**: Added contextual instructions throughout the app:
  - Purple instruction boxes on game cards before voting
  - Blue instruction boxes on game detail pages with tips
  - Welcome banner on home page explaining the 3-step process
- **Demo Content**: Added 3 active demo games for testing voting and sharing features
- **User Interface**: Enhanced game cards with better visual indicators and share functionality

### Production Farcaster Authentication
- **Date**: August 1, 2025
- **Real Farcaster Integration**: Complete production-ready authentication system:
  - Farcaster Auth Kit integration with proper Sign In flow
  - Automatic user creation and session management
  - Persistent authentication - users stay logged in indefinitely across sessions
  - No demo mode - only real Farcaster accounts
  - Production-ready domain configuration
  - Logout functionality in navigation header with session clearing
- **Farcaster Frame Support**: Added working Frame endpoints:
  - POST /api/frame for interactive Frame responses
  - Proper Frame meta tags for social sharing
  - Deep linking to Warpcast for authentication
- **User Flow**: Users must authenticate with Farcaster before accessing any game features
- **Session Persistence**: Authentication state stored in localStorage permanently until manual logout
- **Deployment Ready**: Configured for production deployment on Vercel with proper domain settings

### Farcaster Integration Optimization
- **Date**: August 1, 2025
- **Meta Tags**: Added comprehensive Farcaster Frame meta tags and Open Graph tags for optimal sharing
- **Branding**: Updated app title and descriptions to emphasize Farcaster ecosystem
- **Visual Identity**: Added emojis and Farcaster purple branding throughout the interface
- **Social Features**: Enhanced sharing with Farcaster hashtags and community-focused messaging
- **User Experience**: Highlighted Farcaster usernames with branded colors and styling
- **Creator Attribution**: Emphasized the app being "built natively for Farcaster"

### Vercel Deployment Ready
- **Date**: August 1, 2025
- **Serverless Functions**: Complete API routes configured for Vercel deployment with CORS headers
- **Build Configuration**: Updated vercel.json with proper routing and Node.js runtime
- **Production Optimization**: Added CORS middleware and session handling for production
- **Documentation**: Created comprehensive DEPLOYMENT.md guide with complete setup instructions
- **UI Fixes**: Resolved text overlapping issues in leaderboard and reduced navigation logo size
- **Storage**: Optimized in-memory storage for serverless environment with user creation fixes
- **Real-time Stats**: Fixed user creation and stats updating system for live deployment
- **API Endpoints**: All serverless functions with proper error handling and logging

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database adapter
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **express**: Node.js web application framework

### UI & Design System
- **@radix-ui/***: Accessible, unstyled UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library built on Radix UI
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for Node.js development
- **wouter**: Lightweight React router
- **zod**: Runtime type validation and schema definitions

### Authentication Integration
- **Farcaster Protocol**: Decentralized social network for user authentication
- **connect-pg-simple**: PostgreSQL session store for Express

### Styling & Theming
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx & tailwind-merge**: Conditional className utilities
- **CSS Custom Properties**: Design token system for colors, spacing, and typography