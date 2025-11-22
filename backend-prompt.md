# BACKEND PROMPT - Dance.cash APIs & Database

## Overview
This prompt defines all backend APIs, database queries, and real-time integrations for Dance.cash. Every endpoint returns REAL data from Supabase. No mock data, no fake responses. All data is live and real-time.

## Backend Stack
- **Runtime:** Node.js (Next.js API Routes)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth (JWT)
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage (for images)

---

## SUPABASE SETUP INSTRUCTIONS

### Step 1: Create Supabase Project
1. Visit: https://supabase.com
2. Click "Create new project"
3. Enter project name: "dance-cash"
4. Choose password (save this!)
5. Select region closest to you
6. Wait for project to initialize (~2 minutes)

### Step 2: Get API Keys
1. In Supabase dashboard, go to "Settings" → "API"
2. Copy: **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy: **anon/public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Copy: **Service Role** key (SUPABASE_SERVICE_ROLE_KEY) - keep this secret!

### Step 3: Add to Environment Variables
Create `.env.local` file in your Next.js project:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4: Initialize Supabase Client
Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## DATABASE SCHEMA (SQL)

### Step 1: Create Tables in Supabase
Go to Supabase Dashboard → "SQL Editor" → "New query" → Paste each:

**Table 1: Studios**
```sql
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bch_address VARCHAR(55),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_studios_email ON studios(email);
```

**Table 2: Events**
```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255),
  style VARCHAR(100),
  teacher VARCHAR(255),
  banner_url TEXT,
  price_usd DECIMAL(10, 2),
  capacity INT,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_studio_id ON events(studio_id);
CREATE INDEX idx_events_date ON events(date);
```

**Table 3: Signups**
```sql
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_name VARCHAR(255) NOT NULL,
  attendee_phone VARCHAR(20),
  attendee_email VARCHAR(255),
  payment_method VARCHAR(50),
  price_paid_usd DECIMAL(10, 2),
  price_paid_bch DECIMAL(16, 8),
  transaction_id VARCHAR(255),
  nft_txid VARCHAR(255),
  cashtamp_id VARCHAR(255),
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signups_event_id ON signups(event_id);
CREATE INDEX idx_signups_email ON signups(attendee_email);
```

---

## API ENDPOINTS

### 1. Events API (pages/api/events.ts)

#### GET /api/events
**Purpose:** Fetch all events (public)

```typescript
Query Parameters:
- location?: string (filter by location)
- style?: string (filter by dance style)
- from_date?: string (ISO date, filter from this date)

Response:
{
  status: 'success',
  data: [
    {
      id: 'uuid',
      name: 'Bachata Night',
      date: '2025-11-25',
      time: '19:00',
      location: 'Downtown Studio',
      style: 'Bachata',
      teacher: 'Maria Garcia',
      banner_url: 'https://...',
      price_usd: 25,
      capacity: 50,
      current_signups: 12
    }
  ]
}

Real Data:
- Query Supabase events table
- Filter by date (only future events)
- Count actual signups from signups table
- NO hardcoded events
```

#### POST /api/events
**Purpose:** Create new event (studio only)

```typescript
Request Body:
{
  studio_id: 'uuid',
  name: 'Bachata Night',
  description: 'Learn bachata basics',
  date: '2025-11-25',
  time: '19:00',
  location: 'Downtown Studio',
  style: 'Bachata',
  teacher: 'Maria Garcia',
  banner_url: 'https://...',
  price_usd: 25,
  capacity: 50,
  recurring: false
}

Real Data:
- Verify studio_id exists (authenticate)
- Insert into Supabase events table
- Return created event with ID
- NO mock IDs

Response:
{
  status: 'success',
  data: {
    id: 'new-uuid',
    name: 'Bachata Night',
    ...
  }
}
```

#### GET /api/events/[id]
**Purpose:** Get single event details

```typescript
Real Data:
- Query Supabase: SELECT * FROM events WHERE id = params.id
- Query signup count: SELECT COUNT(*) FROM signups WHERE event_id = params.id
- Return event + signup stats

Response:
{
  status: 'success',
  data: {
    id: 'uuid',
    name: 'Bachata Night',
    ...,
    signup_count: 12,
    available_slots: 38
  }
}
```

---

### 2. Signups API (pages/api/signups.ts)

#### POST /api/signups
**Purpose:** Create signup (dancer registration)

```typescript
Request Body:
{
  event_id: 'uuid',
  attendee_name: 'John Doe',
  attendee_phone: '+1234567890',
  attendee_email: 'john@example.com'
}

Real Data:
- Verify event exists
- Check capacity (available slots > 0)
- Insert into Supabase signups table
- Return signup_id for payment flow

Response:
{
  status: 'success',
  data: {
    signup_id: 'new-uuid',
    event_id: 'uuid',
    attendee_name: 'John Doe',
    created_at: '2025-11-21T08:00:00Z'
  }
}

Error Cases:
- Event full: return 400 "No available slots"
- Event not found: return 404
- Invalid email: return 400
```

#### GET /api/signups/[id]
**Purpose:** Get signup details

```typescript
Real Data:
- Query Supabase: SELECT * FROM signups WHERE id = params.id
- Join with events table for event details
- Return full signup record

Response:
{
  status: 'success',
  data: {
    id: 'uuid',
    event_id: 'uuid',
    attendee_name: 'John Doe',
    event: {
      name: 'Bachata Night',
      date: '2025-11-25',
      price_usd: 25
    }
  }
}
```

---

### 3. Payment API (pages/api/payment/)

#### POST /api/payment/generate-address
**Purpose:** Generate unique BCH address for payment

```typescript
Request Body:
{
  signup_id: 'uuid'
}

Real Data:
- Call backend function: Generate Chipnet address
- Store mapping in database (payment_addresses table)
- Return address for user

Response:
{
  status: 'success',
  data: {
    address: 'bchtest:qz2qt...', // Chipnet test address
    amount_bch: 0.0267, // Calculated from USD price
    expiry_minutes: 5
  }
}

Error Cases:
- Signup not found: return 404
- Invalid amount: return 400
```

#### POST /api/payment/verify
**Purpose:** Check blockchain for payment confirmation

```typescript
Request Body:
{
  address: 'bchtest:qz2qt...',
  signup_id: 'uuid',
  expected_amount_bch: 0.0267
}

Real Data:
- Query Chipnet blockchain (real-time)
- Check for UTXOs received at address
- Verify amount matches or exceeds expected
- If confirmed:
  * Update signup: payment_method='bch', confirmed_at=NOW()
  * Trigger NFT minting
  * Return success

Response (Payment Confirmed):
{
  status: 'success',
  confirmed: true,
  data: {
    transaction_id: 'txid...',
    amount_received: 0.0267,
    confirmations: 1,
    next_step: 'NFT minting initiated'
  }
}

Response (Pending):
{
  status: 'pending',
  confirmed: false,
  message: 'Waiting for blockchain confirmation'
}

Real Blockchain Interaction:
- Connect to Chipnet via mainnet.cash SDK
- Poll blockchain every 30 seconds
- Timeout after 5 minutes
- NO mock confirmations
```

#### POST /api/payment/confirm-fiat
**Purpose:** Confirm fiat payment (Google Pay / Apple Pay)

```typescript
Request Body:
{
  signup_id: 'uuid',
  payment_method: 'google_pay' | 'apple_pay',
  transaction_token: 'token...'
}

Real Data:
- Verify payment token with payment processor
- Update signup: payment_method='fiat', confirmed_at=NOW()
- Trigger NFT minting
- Return success

Response:
{
  status: 'success',
  data: {
    signup_id: 'uuid',
    confirmed_at: '2025-11-21T08:00:00Z',
    next_step: 'NFT minting initiated'
  }
}
```

---

### 4. Analytics API (pages/api/analytics.ts)

#### GET /api/analytics/revenue
**Purpose:** Get revenue for studio

```typescript
Query Parameters:
- studio_id: 'uuid' (required, must be authenticated studio)
- period: 'today' | 'week' | 'month' | 'all' (default: 'month')
- start_date?: string (ISO date)
- end_date?: string (ISO date)

Real Data Queries:
- Get all signups for this studio's events
- Filter by date range
- Calculate totals:
  * Total USD revenue
  * Total BCH revenue
  * Signup count
  * Average transaction value
  * Breakdown by payment method

Response:
{
  status: 'success',
  data: {
    period: 'month',
    total_revenue_usd: 1250.00,
    total_revenue_bch: 1.67,
    total_signups: 45,
    average_transaction: 27.78,
    breakdown: {
      bch: {
        count: 15,
        revenue: 0.40,
        percentage: 0.24
      },
      fiat: {
        count: 30,
        revenue: 1.27,
        percentage: 0.76
      }
    }
  }
}

NO Mock Calculations:
- All numbers from real database
```

#### GET /api/analytics/events
**Purpose:** Revenue breakdown by event

```typescript
Real Data:
- Get all events for studio
- For each event:
  * Count signups
  * Sum revenue
  * Calculate average
- Return array sorted by revenue

Response:
{
  status: 'success',
  data: [
    {
      event_id: 'uuid',
      event_name: 'Bachata Night',
      date: '2025-11-25',
      signups: 12,
      revenue_usd: 300,
      revenue_bch: 0.40,
      status: 'upcoming' | 'completed'
    }
  ]
}
```

---

### 5. Authentication API (pages/api/auth/)

#### POST /api/auth/register
**Purpose:** Register new studio

```typescript
Request Body:
{
  email: 'studio@example.com',
  password: 'SecurePassword123',
  studio_name: 'Downtown Dance Studio',
  bch_address: 'bchtest:qz2qt...'
}

Real Data:
- Verify email not already registered
- Hash password using bcrypt
- Insert into Supabase studios table
- Create JWT token

Response:
{
  status: 'success',
  data: {
    studio_id: 'uuid',
    email: 'studio@example.com',
    studio_name: 'Downtown Dance Studio',
    token: 'jwt-token...'
  }
}

Error Cases:
- Email exists: return 409 "Email already registered"
- Invalid password: return 400
```

#### POST /api/auth/login
**Purpose:** Authenticate studio

```typescript
Request Body:
{
  email: 'studio@example.com',
  password: 'SecurePassword123'
}

Real Data:
- Query Supabase studios table
- Verify password hash
- Generate JWT token

Response (Success):
{
  status: 'success',
  data: {
    studio_id: 'uuid',
    email: 'studio@example.com',
    token: 'jwt-token...'
  }
}

Response (Error):
{
  status: 'error',
  message: 'Invalid email or password'
}
```

---

## REAL-TIME SUBSCRIPTIONS

### Subscribe to Events (Frontend)
```typescript
import { supabase } from '@/lib/supabase';

const subscription = supabase
  .from('events')
  .on('*', payload => {
    console.log('Event updated:', payload);
    // Refresh event list in real-time
  })
  .subscribe();

// Clean up:
subscription.unsubscribe();
```

### Subscribe to Signups (Studio Dashboard)
```typescript
const subscription = supabase
  .from('signups')
  .on('INSERT', payload => {
    console.log('New signup:', payload.new);
    // Add to signup list in real-time
  })
  .subscribe();
```

---

## ERROR HANDLING

All endpoints return standardized errors:

```typescript
{
  status: 'error',
  code: 'ERROR_CODE',
  message: 'Human-readable message'
}
```

Common Errors:
- 400: Bad Request (validation failed)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate entry)
- 500: Internal Server Error

---

## SECURITY

- All endpoints require HTTPS
- Sensitive API keys only in server-side `.env`
- Supabase anon key for client-side public data
- Service role key only for admin operations
- JWT validation on protected endpoints
- Rate limiting on auth endpoints
- SQL injection prevention via Supabase ORM

---

## REAL DATA CHECKLIST

- [ ] Every query reads from actual Supabase database
- [ ] No hardcoded test data
- [ ] All calculations from real values
- [ ] Real-time updates via Supabase subscriptions
- [ ] Real blockchain queries (Chipnet) for payments
- [ ] Real authentication (JWT tokens)
- [ ] Real image storage (Supabase Storage)
- [ ] Error handling for network failures
- [ ] Logging for debugging (no sensitive data)

---

## NEXT STEP

Pass this prompt to your backend/Node.js specialist. They will:
1. Setup Supabase project with provided instructions
2. Create database schema
3. Build all API endpoints with real data queries
4. Implement real-time subscriptions
5. Deploy to production (Vercel or similar)

**Everything is real. All data streams live. No mock anywhere.**
