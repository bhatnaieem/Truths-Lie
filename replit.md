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