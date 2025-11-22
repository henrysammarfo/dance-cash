# FRONTEND PROMPT - Dance.cash Views

## Overview
This prompt defines all React/Next.js component views for Dance.cash. Each component uses real Supabase data and real blockchain interactions (no mock data). Components are modular, reusable, and import from organized folders.

## Project Structure
```
dance-cash/
├── pages/
│   ├── index.tsx (Landing - Event List)
│   ├── events/[id].tsx (Event Detail)
│   ├── signup/[eventId].tsx (Signup Form)
│   ├── payment/[signupId].tsx (Payment Selection)
│   ├── confirmation/[signupId].tsx (Success + NFT QR)
│   ├── studio/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx (Main Admin)
│   │   ├── create-event.tsx
│   │   └── analytics.tsx
│   └── _app.tsx (Global Layout)
│
├── components/
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── EventCard.tsx
│   ├── EventForm.tsx
│   ├── PaymentOptions.tsx
│   ├── QRCodeDisplay.tsx
│   ├── LoadingSpinner.tsx
│   └── forms/
│       ├── SignupForm.tsx
│       ├── LoginForm.tsx
│       └── EventCreationForm.tsx
│
└── styles/
    └── globals.css (Tailwind)
```

---

## COMPONENT REQUIREMENTS

### 1. Layout Component (components/Layout.tsx)
**Purpose:** Wrapper for all pages with header, navigation, footer

```
Props:
- children: React.ReactNode
- title?: string
- isStudioView?: boolean

Features:
- Responsive header with Logo
- Navigation links (Home, For Studios, Account)
- Footer with links
- Consistent styling across pages
```

---

### 2. Navigation Component (components/Navigation.tsx)
**Purpose:** Top navigation bar

```
Displays:
- Dance.cash logo/branding
- "Browse Events" link
- "For Studios" button
- Account/Login button
- Mobile hamburger menu

Real Data From:
- Supabase: Check current user auth status
- Show "Login" if not authenticated
- Show "Dashboard" if studio authenticated
```

---

### 3. EventCard Component (components/EventCard.tsx)
**Purpose:** Reusable event card for event list

```
Props:
- event: EventType (from Supabase)
- onClickSignup?: () => void

Displays:
- Event banner image (from Supabase event.banner_url)
- Event name, style, teacher name
- Location
- Price in USD
- Signup button

Data Source:
- REAL data from Supabase events table
- NO mock data
```

---

### 4. Events List Page (pages/index.tsx)
**Purpose:** Landing page showing all events

```
Real Data Queries:
- Fetch ALL events from Supabase (events table)
- Filter by:
  - Date (future only)
  - Location (user can filter)
  - Dance style (user can filter)
  - Capacity (show available slots)

Display:
- Search/filter form
- Grid of EventCard components
- Pagination if many events
- "No events found" message if empty
- Link to create studio account

Real-time Updates:
- Use Supabase real-time subscriptions (if event added/deleted)
- Show new events without page refresh
```

---

### 5. Event Detail Page (pages/events/[id].tsx)
**Purpose:** Full event information page

```
Real Data Queries:
- GET event by ID from Supabase (events table)
- GET signup count for this event
- GET capacity and available slots

Display:
- Event banner (full width)
- Event name, description, date, time
- Location with map
- Teacher name and bio
- Price (USD and BCH with 10% discount)
- Current signup count vs capacity
- "Sign Up Now" button (if slots available)
- Reviews/ratings (future feature)

Error States:
- Event not found → Show 404
- Event is full → Disable signup
- Event is in the past → Show "Event ended"

No Mock Data:
- All data from Supabase queries
```

---

### 6. Signup Form Page (pages/signup/[eventId].tsx)
**Purpose:** Dancer enters name, email, phone

```
Real Data:
- Fetch event details from Supabase (for display)
- Pre-fill from localStorage if user visited before

Form Fields:
- Name (required)
- Phone (optional but recommended)
- Email (required)
- Checkbox: "Save my info for next time"

LocalStorage:
- If checkbox checked: save name, phone, email
- Next signup: auto-populate these fields

Validation:
- Email format check
- Name min 2 characters
- Phone format validation (if provided)

On Submit:
- Create record in Supabase: signups table
- Store: event_id, name, phone, email, timestamp
- Redirect to payment page with signup_id
- No mock data: real database insert
```

---

### 7. Payment Selection Page (pages/payment/[signupId].tsx)
**Purpose:** Choose BCH or Fiat payment

```
Real Data:
- Fetch event details (for price display)
- Fetch signup details (to confirm info)

Display:
- Event name and price (USD)
- Signup confirmation (name, email)

Payment Options:
1. BCH Payment (10% discount)
   - Show price in BCH (USD * 0.9 / BCH_price)
   - Show QR code
   - Show "Save amount" in USD

2. Fiat Payment (Google Pay / Apple Pay)
   - Show price in USD
   - Show payment processor logos

On Selection:
- BCH: Generate payment address → Show QR → Redirect to confirmation
- Fiat: Open Payment Request API → Process → Redirect to confirmation

No Mock Data:
- Real price calculations
- Real address generation (from backend)
```

---

### 8. Confirmation Page (pages/confirmation/[signupId].tsx)
**Purpose:** Show success, QR codes, NFT info

```
Real Data:
- Fetch signup details from Supabase
- Get payment status (confirmed or pending)
- Get NFT transaction ID (if minted)

Display:
1. Success Message
   - "You're signed up for [Event Name]!"
   - "See you on [Date]"

2. Event Details
   - Event name, date, time, location
   - Ticket number/ID

3. NFT Ticket QR
   - Display Selene Wallet deeplink QR
   - Text: "Scan to receive your NFT ticket"
   - Instructions to download Selene Wallet

4. CashStamp Cashback QR
   - Display CashStamp redemption QR
   - Text: "Scan to claim your BCH cashback"
   - Show cashback amount

5. Next Steps
   - Add to calendar link
   - Email reminder option
   - Share event link

No Mock Data:
- All QR codes generated from real data
- Real NFT transaction ID from blockchain
- Real signup confirmation from database
```

---

### 9. Studio Login Page (pages/studio/login.tsx)
**Purpose:** Studio/organizer authentication

```
Form Fields:
- Email (required)
- Password (required)

Real Authentication:
- Use Supabase Auth
- Validate against studios table
- Set JWT token in cookies

On Success:
- Redirect to studio/dashboard
- Store studio_id in context

Validation:
- Email format
- Password minimum 8 characters
- Error messages for invalid credentials

No Mock Data:
- Real Supabase authentication
```

---

### 10. Studio Register Page (pages/studio/register.tsx)
**Purpose:** Create new studio account

```
Form Fields:
- Studio name (required)
- Email (required)
- Password (required, min 8 chars)
- Confirm password
- BCH wallet address (required)

Real Data Storage:
- Create new record in Supabase: studios table
- Hash password using Supabase Auth
- Store studio name, email, bch_address

Validation:
- Email must be unique (check Supabase)
- BCH address format validation (starts with bchtest: or bitcoincash:)
- Password strength check

On Success:
- Auto-login user
- Redirect to studio/dashboard
- Show "Welcome [Studio Name]!"

No Mock Data:
- Real database insert
- Real password hashing
```

---

### 11. Studio Dashboard (pages/studio/dashboard.tsx)
**Purpose:** Main admin panel for studios

```
Real Data - Multiple Supabase Queries:
- GET studio info (name, logo, etc.)
- GET all events for this studio
- GET all signups for each event
- CALCULATE revenue (sum of paid signups)
- CALCULATE statistics (event count, signup count)

Display:
1. Header
   - Studio name and logo
   - Studio email
   - BCH wallet address (masked)

2. Summary Cards
   - Total Revenue (USD and BCH)
   - Total Events (active + past)
   - Total Signups
   - This Month Revenue

3. Events Table
   - Event name
   - Date and time
   - Status (upcoming/completed)
   - Signup count / Capacity
   - Revenue for this event
   - Actions: Edit, View Details, Cancel Event

4. Recent Signups
   - Attendee name
   - Email
   - Phone
   - Payment status (pending/confirmed)
   - Timestamp

Real-time Features:
- Use Supabase real-time subscriptions
- Show new signups immediately (no refresh)
- Update revenue in real-time

No Mock Data:
- All stats calculated from real database
```

---

### 12. Create Event Form (pages/studio/create-event.tsx)
**Purpose:** Studio creates new event

```
Form Fields:
- Event name (required)
- Description (optional)
- Date (required)
- Time (required)
- Location (required)
- Dance style (dropdown: Bachata, Salsa, Hip-Hop, Contemporary, Other)
- Teacher name (required)
- Price in USD (required)
- Capacity (required)
- Banner image upload (required, Facebook dimensions)
- Recurring (checkbox)
  - If yes: Frequency (weekly, monthly, etc.)
  - If yes: End date

Real Data Handling:
- Image upload to Supabase Storage
- Store banner_url in database
- Create event in Supabase events table

Validation:
- All required fields filled
- Price > 0
- Capacity > 1
- Date is in future
- Image size/format validation

On Submit:
- Insert into Supabase events table
- Link to studio_id
- Redirect to dashboard
- Show success message
- No mock data: real database insert
```

---

### 13. Analytics Page (pages/studio/analytics.tsx)
**Purpose:** Revenue and signup analytics

```
Real Data Queries:
- GET all signups for studio's events (with dates)
- GROUP by date/week/month
- SUM revenue by period
- Calculate BCH vs USD breakdown

Display:
1. Date Range Picker
   - Today, This Week, This Month, All Time
   - Custom date range

2. Revenue Charts
   - Line chart: Revenue over time
   - Bar chart: Signups by event
   - Pie chart: BCH vs Fiat payments

3. Revenue Table
   - Date
   - Revenue (USD)
   - Revenue (BCH)
   - Signup count
   - Average price per signup

4. Payment Breakdown
   - Total via BCH with discount
   - Total via Fiat
   - Average transaction size

No Mock Data:
- All calculations from real Supabase queries
- Real financial data from database
```

---

## STYLING REQUIREMENTS

All components use **Tailwind CSS**:
- Mobile-first responsive design
- Color scheme: Purple/Blue gradient (purple-600 primary)
- Consistent spacing using Tailwind scale
- Touch-friendly buttons (min 44px height)
- Dark text on light backgrounds for accessibility
- QR codes large enough to scan on mobile

---

## REAL DATA INTEGRATION CHECKLIST

- [ ] Every page fetches from Supabase (no mock data)
- [ ] Images from Supabase Storage or user uploads
- [ ] Prices calculated from real USD values
- [ ] Dates are real blockchain timestamps
- [ ] User counts from actual database queries
- [ ] Real-time updates via Supabase subscriptions
- [ ] All forms insert/update real database records
- [ ] No hardcoded test data in production

---

## IMPORT STRUCTURE

```typescript
// Each component imports from organized folders:
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { supabase } from '@/lib/supabase';
import { formatCurrency, calculateBCHPrice } from '@/utils/formatting';

// Pages fetch data using getServerSideProps or useEffect with real queries
// No mock data at any level
```

---

## NEXT STEP

Pass this prompt to your frontend/React specialist or AI code generation tool. They will:
1. Create all components with full Tailwind styling
2. Integrate Supabase queries (using the Backend Prompt)
3. Handle all real data flows
4. Build fully responsive mobile-first UI

**No mock data. All real. All live.**
