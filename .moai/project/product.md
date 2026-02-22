# TasteRank Product Documentation

## Project Overview

**Project Name:** TasteRank (맛랭크)

**Tagline:** Collaborative Food Ranking PWA for Travelers

**Project Type:** Progressive Web Application (PWA)

**Current Version:** 0.1.0

**Status:** Active Development

---

## Product Description

TasteRank is a progressive web application that enables travelers and food enthusiasts to collaboratively discover, rate, and rank food experiences from their trips. The platform combines social features, AI-powered insights, and competitive gameplay to create an engaging food discovery experience.

Core value proposition: Transform individual food memories into collaborative rankings through intuitive rating systems, AI-powered analysis, and competitive tournaments.

---

## Target Audience

**Primary Users:**
- Travel enthusiasts and tourists interested in food discovery
- Group travelers planning food experiences together
- Casual food lovers wanting to remember and share restaurant experiences
- Users seeking AI-powered food recommendations

**Secondary Users:**
- Food bloggers and content creators documenting culinary experiences
- Travel planning groups coordinating food activities
- Food photographers and documentation enthusiasts

**User Characteristics:**
- Tech-savvy mobile-first users aged 18-55
- Comfortable with social collaboration features
- Interested in AI-assisted insights and recommendations
- Value intuitive, mobile-optimized interfaces

---

## Core Features

### 1. Trip Management

Create and manage travel food collections with full CRUD operations.

**Capabilities:**
- Create new trips with title, description, location details
- Invite other users via unique invite codes
- Manage trip members with role-based permissions
- Organize food experiences within trip context
- Public/private trip visibility control
- Real-time member activity tracking

**Access Control:**
- Trip creator: Full edit and delete permissions
- Invited members: Add entries and rate based on role
- Public viewers: Read-only access to public trips
- RLS-based security enforces permissions at database level

### 2. Food Entry System

Comprehensive food experience documentation with rich media and metadata.

**Capabilities:**
- Add food experiences with name, location, cuisine type
- Attach multiple photos per entry with cloud storage
- Rate food experiences on 1-10 scale
- Add descriptive notes and comments
- Assign flavor tags (spicy, sweet, umami, etc.)
- Cuisine classification and categorization
- Timestamp and geolocation tracking
- Edit and delete entry ownership

**Rich Media Support:**
- Multiple photo uploads per entry
- Cloud storage via Supabase Storage
- Image compression and optimization
- Thumbnail generation for fast loading

### 3. Rating & Ranking System

Sophisticated multi-dimensional ranking algorithm combining user scores, tournament results, and AI analysis.

**Rating Features:**
- 1-10 scale user ratings with decimal precision
- Average score calculation across all trip members
- Weighted scoring considering:
  - User ratings (40% weight)
  - Tournament competition results (25% weight)
  - AI-generated insights (20% weight)
  - Sentiment analysis (15% weight)
- Ranking views: Overall, by cuisine, by flavor profile
- Trending entries and best performers
- Historical ranking trends over time

**Ranking Views:**
- Trip-level rankings showing best-rated entries
- Cuisine-specific rankings for comparative analysis
- Tag-based rankings for flavor discovery
- Personal vs. group rankings comparison

### 4. AI-Powered Features

Google Gemini integration for intelligent food analysis and recommendations.

**AI Capabilities:**
- **AI Ranking Generation:** Analyze entries and generate reason-based rankings with explanations
- **Follow-Up Questions:** Generate contextual questions to gather user opinions
- **Tag Suggestions:** AI-powered cuisine and flavor tag recommendations
- **Sentiment Analysis:** Extract and analyze emotional responses from descriptions
- **Ranking Explanations:** Provide natural language explanations for ranking decisions

**AI Data Collection:**
- Store AI questions and responses for continuous learning
- Batch process AI rankings for performance optimization
- Track AI effectiveness metrics

### 5. Tournament System

Competitive bracket-style voting mechanism for engaging food comparisons.

**Tournament Features:**
- Create tournaments with food entry selections
- Single-elimination bracket generation
- Double-elimination tournament support
- Head-to-head food voting with explanation prompts
- Real-time bracket visualization
- Leaderboard and winner tracking
- Tournament history and replay capability
- Share tournament results

**Voting Mechanism:**
- Compare two foods side-by-side
- Collect user preference explanations
- Optional text feedback on voting decisions
- Weighted contribution to overall food rankings

### 6. Tagging System

Flexible metadata system for food classification and discovery.

**Tag Types:**
- **Cuisine Tags:** Thai, Korean, Italian, Japanese, etc.
- **Flavor Tags:** Spicy, Sweet, Savory, Umami, Salty, Sour
- **Style Tags:** Street Food, Fine Dining, Casual, Fast Casual
- **Experience Tags:** Hidden Gem, Popular, Expensive, Budget-Friendly

**Tagging Features:**
- Pre-defined tag library with suggestions
- AI-powered tag recommendations
- Custom tag creation by trip members
- Tag-based filtering and search
- Tag popularity tracking
- Multi-tag support per entry

### 7. Food Detail Pages

Individual food item detail pages with rich media and social features.

**Detail Page Features:**
- Full-screen photo carousel with pagination dots and snap-scroll navigation
- Food name, restaurant location, average rating display
- Associated flavor tags and cuisine classification
- Member reviews with individual ratings and comments
- AI Verdict section showing AI-generated ranking insights when available
- Lazy authentication for review submission (LoginPrompt modal)
- Review composition interface with 1-10 rating scale
- Bottom action bar with Map and Review buttons
- Mobile-first responsive design optimized for small screens
- Server-side rendering for SEO and initial load performance

**Lazy Auth Pattern:**
- Anonymous users can view detail pages (public entries)
- Review submission triggers LoginPrompt modal only when needed
- No forced authentication on app entry
- Seamless Google OAuth flow for authenticated users

### 8. Authentication & Security

Google OAuth authentication with lazy authentication pattern.

**Authentication Model:**
- Google OAuth login (exclusive provider)
- Lazy authentication: Prompt only on action attempt
- No forced login on app load
- Session persistence with JWT tokens
- Automatic token refresh via middleware
- Secure token storage in httpOnly cookies

**User Profiles:**
- Profile creation on first login
- User avatar and display name
- Account settings management
- Privacy preference configuration

---

## Use Cases

### Use Case 1: Group Travel Food Discovery

A travel group plans a weekend trip and wants to document and rank all restaurant visits.

**Flow:**
1. Trip organizer creates new trip "Bangkok Weekend Getaway"
2. Generates invite code and shares with group
3. Group members add food entries as they dine
4. All members rate and comment on experiences
5. App generates AI-powered rankings mid-trip
6. Team engages in competitive tournaments
7. Post-trip archives and shares rankings

**Value:** Keeps group aligned on best experiences and creates shared memories.

### Use Case 2: Solo Traveler Documentation

Individual traveler wants to remember and reflect on food experiences.

**Flow:**
1. Create personal trip "Kyoto 2025"
2. Add entries privately (not shared)
3. Rate and reflect on each experience
4. Review trends in preferences
5. Generate personal rankings
6. Optional: Share specific entries with friends

**Value:** Creates personal food journal with retrospective insights.

### Use Case 3: Food Discovery Community

Public trips enable food enthusiasts to discover new restaurants.

**Flow:**
1. Browse popular public trips
2. View top-rated entries in destination
3. Filter by cuisine or flavor preferences
4. Save entries to personal lists
5. Plan visits based on community rankings
6. Add own experiences to contribute

**Value:** Leverages crowd wisdom for authentic food recommendations.

### Use Case 4: Tournament Entertainment

Group uses competitive gameplay for social engagement.

**Flow:**
1. Participants add favorite entries from past trips
2. Create tournament bracket
3. Vote on favorite foods over bracket rounds
4. Compete for tournament winner status
5. Share tournament results and bragging rights

**Value:** Gamifies food discovery and strengthens group bonding.

---

## Business Value

### User Engagement
- Gamified experience with tournaments and rankings
- Collaborative features encouraging group participation
- AI-powered insights providing continuous value
- PWA accessibility reducing friction to entry

### Data Assets
- Rich food experience database by location
- User preference patterns and food trends
- Community-validated restaurant quality metrics
- AI training data from ratings and feedback

### Monetization Opportunities
- Premium features: advanced analytics, export functionality
- Partnerships with restaurants and food tourism
- Food blogger tools and content creation features
- Travel planning integration with booking platforms

### Competitive Differentiation
- AI-powered ranking explanations vs. simple averages
- Competitive tournament gameplay not typical in food apps
- Collaborative trip management for group travel
- Lazy authentication removing friction
- PWA enabling offline functionality

---

## Access Control Model

### Public Routes (unauthenticated access allowed)

**Routes:** `(public)` directory paths

- Trip listing page with search and filtering
- Trip detail pages for public trips
- Entry detail pages with ratings
- Ranking pages showing top-rated entries
- Tournament results viewing

**RLS Policy:** `is_public = TRUE` data is SELECT-able by anonymous users

### Protected Routes (authentication required)

**Routes:** `(protected)` directory paths - Login prompt triggered on access attempt

- Trip creation and editing
- Entry creation and modification
- Rating submission and updates
- Tournament creation and voting
- User profile management
- Favorites and personal lists

**RLS Policy:** User-specific rows or role-based permissions enforced

### Auth Routes (authentication related)

**Routes:** `(auth)` directory paths

- Google OAuth callback handling
- Authentication state management
- Token refresh and validation

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.1 |
| UI Components | shadcn/ui (selective) | 3.8.4 |
| Database | Supabase PostgreSQL | Latest |
| Authentication | Google OAuth + Supabase Auth | - |
| AI | Google Generative AI (Gemini) | 0.24.1 |
| Forms | React Hook Form | 7.71.1 |
| Validation | Zod | 4.3.6 |
| PWA | @serwist/next | 9.5.6 |
| Testing | Jest | 30.2.0 |
| Package Manager | pnpm | Latest |
| Deployment | Vercel | - |

---

## Key Metrics

**Current State (as of February 2026):**
- 136 TypeScript/TSX source files
- 44 test files (32% test coverage by file count)
- 13 database tables + 3 views
- 8 custom React hooks
- 7 API routes for AI and cron jobs
- 11 SQL migration files

**Quality Targets:**
- Test coverage: 85%+ across codebase
- Lighthouse performance: 90+
- Mobile lighthouse: 95+
- Accessibility (WCAG 2.1): Level AA
- Zero security vulnerabilities

---

## Development Workflow

**Command Reference:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Production build
- `pnpm test` - Run Jest test suite
- `pnpm lint` - ESLint validation
- `pnpm exec supabase db push` - Apply migrations
- `pnpm exec supabase gen types typescript` - Generate database types

**Git Convention:**
- Conventional commits (fix:, feat:, docs:, etc.)
- Feature branches from main
- Pull requests with comprehensive descriptions
- Squash merges to maintain clean history

---

## Success Criteria

**Phase 1 (Current):**
- Core trip management with collaborative editing
- Food entry system with photo support
- Basic 1-10 rating system
- Tournament competitive gameplay
- Google OAuth authentication
- PWA functionality with offline support

**Phase 2 (Planned):**
- Advanced AI ranking with detailed explanations
- Group analytics and trends
- Restaurant integration with maps
- Social sharing and notifications
- Export and reporting features

**Phase 3 (Future):**
- Mobile native apps (iOS/Android)
- Restaurant partner dashboard
- Food blogger tools
- Advanced search and discovery
- Recommendation engine

---

## Document Metadata

| Field | Value |
|-------|-------|
| Created | 2026-02-22 |
| Last Updated | 2026-02-22 |
| Version | 1.1 |
| Language | English |
| Audience | Product teams, developers, stakeholders |
| Features Implemented | 9 core features (Trip Management, Food Entries, Rating, AI, Tournaments, Tagging, Detail Pages, Auth) |
