# Design Guidelines: Property Analysis Web App

## Design Approach

**Selected Approach:** Hybrid Reference + System  
**Primary References:** Zillow, Redfin, Rightmove (property display) + Material Design (data components)  
**Rationale:** Property analysis tools require trusted data presentation with visual appeal for property showcases. Balance professional analytics interface with engaging property viewing experience.

## Core Design Principles

1. **Data Clarity First:** Property information must be scannable and hierarchical
2. **Trust & Professionalism:** Clean, organized layouts that convey reliability
3. **Progressive Disclosure:** Show critical data upfront, details on demand
4. **Real-time Feedback:** Clear visual states for analysis progress

---

## Typography

**Font Stack:** Inter (via Google Fonts CDN) for entire interface

**Hierarchy:**
- Hero/Page Titles: text-4xl to text-5xl, font-bold
- Section Headers: text-2xl to text-3xl, font-semibold  
- Property Titles: text-xl, font-semibold
- Data Labels: text-sm, font-medium, uppercase tracking-wide
- Body Text: text-base
- Metadata/Secondary: text-sm
- Fine Print: text-xs

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16, 24**

**Grid Structure:**
- Container: max-w-7xl mx-auto px-4
- Property Cards: 2-column on md+, single column mobile
- Data Sections: Consistent py-8 to py-16 between major sections

---

## Component Library

### Navigation
- **Simple Header:** Logo/title left, minimal navigation (no auth needed)
- Height: h-16
- Sticky positioning during scroll
- Border bottom separator

### Property Input Section
- **Prominent Search Form:**
  - Large input field (h-12 to h-14)
  - Clear placeholder: "Enter Rightmove property URL..."
  - Primary action button adjacent or below
  - Input validation states (idle, loading, error, success)

### Real-time Status Display
- **SSE Connection Indicator:**
  - Pill-shaped status badge showing: "Analyzing...", "Complete", "Error"
  - Animated pulse effect during active analysis
  - Progress indicator or elapsed time counter
  - Positioned prominently above results area

### Property Display Card
- **Full-width Feature Card Layout:**
  - Image gallery at top (hero-style, aspect ratio 16:9 or 2:1)
  - Image carousel with thumbnail navigation
  - Property title and price positioned over image (bottom-left) with backdrop blur
  - Key metrics row immediately below image (beds, baths, sqft in grid)

### Property Details Sections
- **Tabbed Interface or Accordion Sections:**
  - Overview (description, key features)
  - Specifications (all property data in organized table)
  - Location (embedded map + transport links)
  - Analytics/Insights (visualized data)
  - Photos (full gallery view)

### Data Tables
- **Striped Rows:** Alternating row backgrounds for readability
- **Column Headers:** Sticky, font-medium, smaller text
- **Cell Padding:** px-4 py-3 for breathing room

### Key Features List
- **Badge Grid:** Display property features as rounded badges
- Wrap layout, gap-2
- Each badge: px-3 py-1.5, text-sm, rounded-full

### Location Display
- **Map Integration:** Embedded map (16:9 aspect ratio)
- Transport links as card list below map
- Station icons + distance + type display

### Analytics Visualization
- **Simple Charts/Graphs:** Use chart.js or recharts
- Bar charts for comparisons
- Clean axis labels, gridlines
- Tooltips on hover

### Loading States
- **Skeleton Screens:** For property card while loading
- Shimmer animation effect
- Match actual component dimensions

### Empty States
- **Centered Message:** When no property loaded
- Illustration or icon
- Clear CTA to input property URL

### Error States
- **Alert Banners:** Clear error messaging
- Retry action button where applicable
- Friendly, helpful tone

---

## Images

**Hero Section:** No traditional hero image needed - property images serve as visual anchors

**Property Images:**
- Main gallery at top of property card (carousel, 16:9 ratio)
- Thumbnail strip below main image (4-6 visible)
- Lightbox/modal for full-screen viewing
- Lazy loading for performance

**Icons:** Use Heroicons (via CDN) for UI elements
- Status indicators (clock, check, alert)
- Property features (bed, bath, rulers, car)
- Navigation (arrows, close, menu)

**Empty State:** Simple icon illustration (house outline or magnifying glass)

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Stacked input and button
- Simplified property cards
- Collapsed data tables (accordion pattern)

**Tablet (768px - 1024px):**
- 2-column property feature grid
- Side-by-side layout for some data

**Desktop (1024px+):**
- Full multi-column layouts
- Wider containers (max-w-7xl)
- Expanded data tables

---

## Animation & Interaction

**Minimal, Purposeful Animations:**
- Fade-in for loaded content (duration-300)
- Status indicator pulse during analysis
- Smooth tab/accordion transitions (duration-200)
- Image carousel slide (duration-300)

**NO:** Elaborate scroll effects, parallax, complex page transitions

---

## Page Structure

### Main Application View (Single Page)

1. **Header** (h-16, sticky)
   - Logo/Title
   - Optional status indicator

2. **Input Section** (py-12)
   - Property URL input (centered, max-w-2xl)
   - Submit button
   - Status display below

3. **Results Section** (when available)
   - Property Image Gallery (full-width within container)
   - Property Title & Price (text-3xl, font-bold)
   - Quick Stats Grid (3-4 columns: beds, baths, size, type)
   - Tabbed Content Area:
     - Overview Tab: Description + Key Features
     - Details Tab: Full specifications table
     - Location Tab: Map + Transport
     - Analytics Tab: Data visualizations
     - Photos Tab: Full gallery grid

4. **Footer** (py-8, mt-16)
   - Minimal: powered by notice, links

**Layout Flow:** Vertical, single-column main content, data organized in tabs/sections for scannability