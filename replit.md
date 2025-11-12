# Property Analysis Web App

## Overview

This is a webhook-driven property analysis application that fetches and displays detailed property listings from Rightmove. Users submit property URLs, which trigger an external n8n webhook that processes the listing data. The application receives results via callback, stores them in memory, and displays comprehensive property information including photos, location data, analytics, and condition assessments.

The application uses a modern React frontend with shadcn/ui components and an Express backend that manages webhook interactions and server-sent events for real-time updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with Vite as the build tool and development server

**UI Component System**: shadcn/ui based on Radix UI primitives with Tailwind CSS styling
- Component library follows "New York" style variant
- Uses CSS variables for theming with HSL color system
- Supports light/dark mode theming
- Typography hierarchy uses Inter font family via Google Fonts CDN

**Design Pattern**: Property listing interface inspired by Zillow/Redfin/Rightmove with Material Design data components
- Progressive disclosure: critical data shown first, details on demand
- Tab-based navigation for different property information sections (Overview, Details, Location, Analytics, Photos)
- Real-time status feedback during analysis

**State Management**: 
- TanStack Query (React Query) for server state and API interactions
- Local React state for UI-specific concerns
- Server-Sent Events (SSE) for real-time analysis status updates

**Routing**: Wouter for client-side routing (lightweight alternative to React Router)

**Layout**: Application uses shadcn Sidebar component for navigation
- SidebarProvider wraps the entire app in App.tsx
- AppSidebar displays chronological history of property analyses
- Main content area shows PropertyInput and analysis results
- Header with sidebar toggle and app title

**Key UI Components**:
- AppSidebar: Chronological history list with thumbnails, address, price, bed/bath info
- PropertyInput: URL submission form
- PropertyGallery: Image carousel for property photos
- PropertyHeader: Address, price, and basic stats display
- PropertyTabs: Tabbed interface for different data sections
- StatusBadge: Real-time analysis status indicator
- Section-specific tabs: OverviewTab, DetailsTab, LocationTab, FloorplanAnalysisTab, ImageConditionTab, AnalyticsTab, PhotosTab

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Server Pattern**: Hybrid development/production setup
- Development: Vite dev server middleware for HMR
- Production: Static file serving from built assets

**API Endpoints**:
- `POST /api/trigger`: Initiates property analysis by calling external n8n webhook
- `POST /api/analysis/callback`: Receives analysis results from n8n webhook
- `GET /api/stream`: Server-Sent Events endpoint for real-time status updates
- `GET /api/results`: Fetches stored analysis results by super_id or property_url
- `GET /api/history`: Returns chronological list of recent analyses with lightweight metadata
- `POST /api/test/simulate-callback`: Test mode simulation endpoint

**Data Flow**:
1. User submits property URL via frontend
2. Frontend calls `/api/trigger`
3. Backend calls n8n webhook with property URL and callback URL
4. n8n processes property data (may take minutes)
5. n8n posts results to `/api/analysis/callback`
6. Backend normalizes data, stores in memory, notifies SSE clients
7. Frontend receives notification and fetches complete results

**Real-time Communication**: Server-Sent Events (SSE) for push notifications when analysis completes
- Clients connect to `/api/stream` with property_url parameter
- Server maintains array of connected clients
- On callback receipt, server broadcasts to waiting clients
- Includes timeout handling (5 minutes default)

**Request Logging**: Custom middleware logs API requests with duration and truncated response data

### Data Storage

**Storage Strategy**: In-memory storage using Map data structures
- Dual-index storage: by super_id and by property_url
- Chronological history array (capped at 50 most recent entries)
- Deduplication: storing same super_id updates existing entry instead of creating duplicate
- No persistent database (data lost on server restart)
- Suitable for MVP/demo purposes
- Note: Application is configured for PostgreSQL with Drizzle ORM but not actively using it

**Data Model**: 
- Normalized property result schema defined in `shared/schema.ts`
- Includes: key identifiers, floorplan data, image condition assessment, detailed property snapshot
- Zod schemas for validation

**Storage Interface** (`IStorage`):
- `storeResult()`: Save normalized property data with deduplication
- `getResultBySuperId()`: Retrieve by super_id
- `getResultByPropertyUrl()`: Retrieve by property_url  
- `getAllResults()`: Fetch all stored results
- `getAllResultsChrono()`: Fetch chronological history (newest first, max 50 entries)

### Data Normalization

**Normalization Layer** (`server/normalize.ts`): Transforms raw n8n webhook payload into consistent schema
- Handles arrays and single objects
- Extracts nested property data from multiple possible locations
- Processes photos, floorplans, EPCs, stations, schools
- Constructs snapshot with transaction type, bedrooms, bathrooms, size, price, address, agent info
- Handles missing/null data gracefully

## Features

### History Sidebar

**Purpose**: View and access previous property analyses without re-running them

**Architecture**:
- **URL-based selection**: Uses query parameters (`/?id={super_id}`) for deep-linking
- **Auto-refresh**: History list updates every 10 seconds and after completing new analyses
- **Deduplication**: Each super_id appears only once in history (updates replace old entries)
- **Chronological ordering**: Most recent analyses appear first
- **Capacity**: Stores up to 50 most recent analyses

**UI Components**:
- AppSidebar component (`client/src/components/AppSidebar.tsx`)
- Displays: thumbnail, address, price, bedrooms, bathrooms, relative timestamp
- "New Analysis" button to clear selection and start fresh analysis

**Data Flow**:
1. User clicks history item → URL updates to `/?id={super_id}`
2. Home.tsx detects URL change via useLocation hook
3. Reads super_id from URL params → updates local state
4. Clears propertyUrl and closes any active SSE connections
5. Sets status to "complete" (bypasses analyzing state)
6. useQuery fetches data from `/api/results?super_id={id}`
7. Property data renders without status badge (read-only view)

**New Analysis Flow**:
1. User clicks "New Analysis" or submits new URL
2. Navigate to `/` (clears query params)
3. Triggers normal SSE-based analysis workflow
4. On completion, invalidates history query to show new entry

**Backend**:
- `GET /api/history` endpoint returns lightweight metadata for sidebar
- Extracts: super_id, property_url, received_at, address, price, thumbnail, bed/bath
- Uses `getAllResultsChrono()` from storage interface

### Floorplan Analysis Tab

**Purpose**: Display parsed floorplan CSV data with room dimensions and total area

**Data Source**: `fp_inline_csv` field from n8n webhook (floorplan_data)

**Features**:
- Room-by-room breakdown table with metric and imperial dimensions
- Door and window counts per room
- Total area summary (metric and imperial)
- Annotated floorplan image display (when available)
- Download links for CSV/JSON resources

**Implementation**:
- Uses Papaparse library for robust CSV parsing
- Handles quoted fields, embedded newlines, empty columns
- Filters to show only segment rows (actual rooms)
- Maps column names from CSV headers

### Image Condition Analysis Tab

**Purpose**: Display AI-powered property condition assessment based on photos

**Data Source**: `image_condition_data` from n8n webhook

**Features**:
- Overall condition score (0-100) with color-coded badge
- Images grouped by room type (living space, kitchen, bedroom, bathroom, facade, neighborhood)
- Per-image condition scores with labels (Excellent, Above Average, Below Average, Poor)
- Detailed AI reasoning for each assessment
- Weighted average calculation based on total image count

**Score Interpretation**:
- 80-100: Excellent (green)
- 60-79: Above Average (blue)
- 40-59: Below Average (yellow)
- 0-39: Poor (red)

## External Dependencies

### Third-Party Services

**n8n Webhook**: `https://supersami.app.n8n.cloud/webhook/d36312c5-f379-4b22-9f6c-e4d44f50af4c`
- Accepts: `{ property_url, callback_url }`
- Processes Rightmove property listings
- Returns comprehensive property data via callback
- Processing time: potentially several minutes
- Non-polling architecture: uses callback pattern

**Environment Configuration**:
- `PUBLIC_BASE_URL`: Public HTTPS URL for callback endpoint (must be accessible to n8n)
- `TEST_MODE`: Boolean flag to enable local simulation without calling n8n
- `PORT`: Server port (defaults to 5000)

### Database Setup

**ORM**: Drizzle ORM configured for PostgreSQL
- Configuration in `drizzle.config.ts`
- Schema defined in `shared/schema.ts`
- Database client: `@neondatabase/serverless`
- Migration output directory: `./migrations`
- Note: Currently not actively used, storage is in-memory only

### UI Component Libraries

**Core UI**: Radix UI primitives (@radix-ui/react-*)
- Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, etc.
- Provides accessible, unstyled component primitives

**Styling**: 
- Tailwind CSS for utility-first styling
- class-variance-authority (CVA) for component variants
- clsx/tailwind-merge for conditional class composition

**Additional Libraries**:
- recharts: Chart visualization for analytics tab
- embla-carousel-react: Carousel functionality
- react-hook-form + @hookform/resolvers: Form handling with Zod validation
- date-fns: Date formatting and manipulation
- lucide-react: Icon library
- cmdk: Command palette component
- wouter: Lightweight routing

### Development Tools

**Replit-specific Plugins**:
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Code navigation
- @replit/vite-plugin-dev-banner: Development banner