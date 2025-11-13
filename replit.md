# Property Analysis Web App

## Overview

This application provides detailed property analysis by fetching and displaying listing data from Rightmove. Users submit property URLs, which trigger an external webhook for data processing. The app receives results via callback, stores them temporarily, and presents comprehensive property information including photos, location, analytics, and condition assessments. It features a React frontend with shadcn/ui and an Express backend managing webhook interactions and real-time updates via Server-Sent Events (SSE). The project aims to offer a modern, responsive, and data-rich user experience for property analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and Vite, utilizing shadcn/ui (based on Radix UI and Tailwind CSS) for its component library, following the "New York" style variant with HSL-based CSS variables for theming. Key UI/UX decisions include a Zillow/Redfin-inspired layout with progressive disclosure, tab-based navigation (Overview, Details, Location, Analytics, Photos), and real-time status feedback. State management is handled by TanStack Query for server state and local React state for UI concerns, with Wouter for client-side routing. Server-Sent Events provide real-time analysis status updates. The application features an `AppSidebar` for chronological history and `PropertyInput` for URL submission.

### Backend

The backend uses Express.js with TypeScript. It provides API endpoints for triggering analysis (`POST /api/trigger`), receiving webhook callbacks (`POST /api/analysis/callback`), streaming real-time updates via SSE (`GET /api/stream`), fetching results (`GET /api/results`), and retrieving analysis history (`GET /api/history`). The system employs a non-polling architecture where the backend calls an n8n webhook, which then posts results back to the application. Real-time updates are pushed to the frontend via SSE, with automatic polling fallback when SSE fails (common in published environments). 

**Environment Detection**: The callback URL is automatically determined based on the runtime environment. In deployed/published apps, it detects `REPLIT_DEPLOYMENT === "1"` and parses `REPLIT_DOMAINS` to extract the published `.replit.app` domain (e.g., `https://supersami-analysis.rolfgroenewold.replit.app`). In development, it uses `PUBLIC_BASE_URL` from workspace secrets or defaults to `http://localhost:5000`. This ensures n8n callbacks are routed to the correct environment without manual configuration. Resolution order: REPLIT_DOMAINS → PUBLIC_BASE_URL → localhost.

### Data Storage

The application uses an in-memory storage strategy with `Map` data structures, indexed by `super_id` and `property_url`. A chronological history of up to 50 recent analyses is maintained. Data is not persistent and is lost on server restarts. A normalized property result schema (defined in `shared/schema.ts` with Zod validation) ensures data consistency. While configured for PostgreSQL with Drizzle ORM, it is not actively used.

### Data Normalization

A normalization layer (`server/normalize.ts`) transforms raw n8n webhook payloads into a consistent, application-wide schema. This process extracts and structures nested property data, including photos, floorplans, EPCs, and location details, and constructs a comprehensive property snapshot, handling missing data gracefully.

### Key Features

*   **History Sidebar**: Allows users to view and access previous analyses via URL-based selection, with auto-refresh and chronological ordering.
*   **Real-time Analysis Status Tracking**: Provides visual feedback on analysis progress (analyzing, complete, error) in the sidebar using status badges and icons, updated via SSE.
*   **Floorplan Analysis Tab**: Displays parsed floorplan CSV data, including room dimensions, total area, and door/window counts, supporting both metric and imperial units.
*   **Image Condition Analysis Tab**: Presents AI-powered property condition assessments based on photos, showing overall scores, confidence levels, and room-level breakdowns.

## External Dependencies

### Third-Party Services

*   **n8n Webhook**: `https://supersami.app.n8n.cloud/webhook/d36312c5-f379-4b22-9f6c-e4d44f50af4c`. Used for processing Rightmove property listings and returning data via callback.
*   **Environment Configuration**: 
    - `PUBLIC_BASE_URL` (optional workspace secret for development callback URL)
    - `TEST_MODE` (enables simulation mode, bypasses n8n webhook)
    - `PORT` (server port, defaults to 5000)
    - Auto-detected in production: `REPLIT_DEPLOYMENT`, `REPLIT_DOMAINS`

### UI Component Libraries

*   **Core UI**: Radix UI primitives (`@radix-ui/react-*`) for accessible, unstyled components.
*   **Styling**: Tailwind CSS, `class-variance-authority (CVA)`, `clsx/tailwind-merge`.
*   **Additional Libraries**: `recharts` (charting), `embla-carousel-react` (carousel), `react-hook-form` + `@hookform/resolvers` (forms), `date-fns` (date utilities), `lucide-react` (icons), `cmdk` (command palette), `wouter` (routing).

### Development Tools (Replit-specific)

*   `@replit/vite-plugin-runtime-error-modal`
*   `@replit/vite-plugin-cartographer`
*   `@replit/vite-plugin-dev-banner`