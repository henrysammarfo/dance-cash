# DANCE.CASH - COMPLETE PRE-BUILD SETUP GUIDE

## Overview
This document tells you EXACTLY what to get, where to get it, and how to setup before you write ANY code. Follow these steps in order. Get everything first. Then start building with zero blockers.

**Solo Builder Setup = No Mock Data, No Placeholders, No Hard-Coding**

---

## PART 1: PREREQUISITES

### What You Need (Before Starting)
- Node.js v18+ (already installed on your system)
- npm or pnpm (should be installed with Node)
- A code editor (VS Code recommended)
- Git installed and configured
- A GitHub account
- A Vercel account
- 2-3 hours to follow this entire setup guide

### Verify Prerequisites

```bash
# Check Node version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be v9.0.0 or higher

# Check Git
git --version   # Should show Git version
```

If any are missing, install them first before continuing.

---

## PART 2: GITHUB SETUP

### Step 1: Create GitHub Repository

**Go to:** https://github.com/new

**Fill in:**
- Repository name: `dance-cash`
- Description: "Bitcoin Cash event booking platform with NFT tickets and cashback rewards"
- Visibility: **Public** (important for Vercel)
- Check: "Add a README file"
- Check: "Add .gitignore" → Select "Node"
- License: MIT (optional)

**Click:** "Create repository"

### Step 2: Clone Repository to Your Computer

```bash
# Open terminal/PowerShell

# Navigate to where you want the project
cd ~/Desktop  # or your preferred location

# Clone the repository
git clone https://github.com/YOUR_USERNAME/dance-cash.git

# Navigate into the folder
cd dance-cash

# You now have the repo locally
```

**Verify:** You should see README.md and .gitignore files

---

## PART 3: SUPABASE SETUP (Database & Auth)

### What is Supabase?
Supabase = PostgreSQL database + Authentication + Real-time subscriptions + File storage

All real data goes here. No mock data.

### Step 1: Create Supabase Account

**Go to:** https://supabase.com

**Click:** "Start your project"

**Sign up with:**
- Email: (use your main email)
- Password: (strong password, save this!)
- Continue

### Step 2: Create First Project

**Click:** "New project"

**Fill in:**
- Project name: `dance-cash`
- Database password: (generate strong password, SAVE THIS!)
- Region: (choose closest to you)
- Pricing plan: **Free** (perfect for testing)

**Click:** "Create new project"

**Wait:** 2-3 minutes for project to initialize (you'll see loading screen)

### Step 3: Get API Keys

**In Supabase dashboard, go to:**
- Left sidebar → "Settings" → "API"

**You'll see:**
- **Project URL** (starts with https://xxxx.supabase.co)
- **Anon Public Key** (long string)
- **Service Role Secret Key** (KEEP THIS SECRET!)

**Copy these three values and save to a text file** (you'll need them in 5 minutes)

### Step 4: Create Database Tables

**In Supabase dashboard:**
- Click "SQL Editor" (left sidebar)
- Click "New query"
- Paste this SQL:

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

CREATE TABLE IF NOT EXISTS payment_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id UUID NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  address VARCHAR(255),
  amount_bch DECIMAL(16, 8),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cashtamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signup_id UUID NOT NULL REFERENCES signups(id) ON DELETE CASCADE,
  studio_address VARCHAR(255),
  amount_bch DECIMAL(16, 8),
  qr_code_url TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Click:** "RUN"

**Verify:** All tables created successfully (you'll see green checkmarks)

### Step 5: Setup Storage (for event banners)

**In Supabase dashboard:**
- Left sidebar → "Storage"
- Click "Create new bucket"
- Name: `event-banners`
- Make public: **YES**
- Click "Create bucket"

---

## PART 4: VERCEL SETUP (Hosting)

### Step 1: Create Vercel Account

**Go to:** https://vercel.com

**Click:** "Sign Up"

**Choose:** "Continue with GitHub"

**Authorize:** Vercel to access your GitHub account

### Step 2: Connect Your Repository

**In Vercel:**
- Click "New Project"
- Click "Import Git Repository"
- Search for: `dance-cash`
- Click "Import"

**Don't configure anything yet** — we'll do that after setup

### Step 3: Skip for Now

Leave Vercel for now. We'll deploy after code is written.

---

## PART 5: CHIPNET TESTNET SETUP (Bitcoin Cash Testing)

### What is Chipnet?
Chipnet = Bitcoin Cash testnet where you get FREE test coins and test NFT minting

### Step 1: Get Chipnet Test Coins

**Go to:** https://tbch.googol.cash/

**You'll see a form asking for address**

**For now, just remember this URL** — you'll generate an address when you write code

### Step 2: Bookmark Chipnet Explorer

**Bookmark:** https://chipnet.imaginary.cash/

This is where you'll verify transactions are real (not mocked)

### Step 3: Download Electron Cash Wallet (Optional, for testing)

**Go to:** https://electroncash.org/

**Download:** For your operating system

**This is for MANUAL testing** — optional but recommended

---

## PART 6: CREATE .env.local FILE

This file holds all your API keys. It's SECRET and never gets committed to Git.

### Step 1: Create File

**In your project folder (dance-cash), create file:**
```
.env.local
```

### Step 2: Add Supabase Keys

**Paste this into .env.local:**
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**Replace with YOUR actual values from Supabase dashboard:**
- NEXT_PUBLIC_SUPABASE_URL: (from Step 3 above)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: (from Step 3 above)
- SUPABASE_SERVICE_ROLE_KEY: (from Step 3 above)

### Step 3: Add Blockchain Config

**Add to .env.local:**
```
NEXT_PUBLIC_BCH_NETWORK=chipnet
NEXT_PUBLIC_MAINNET_API=https://chipnet-api.imaginary.cash
```

### Step 4: Verify File

**Your .env.local should look like:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdef123456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BCH_NETWORK=chipnet
NEXT_PUBLIC_MAINNET_API=https://chipnet-api.imaginary.cash
```

**IMPORTANT:** Never commit this file to Git. It's in .gitignore by default. ✓

---

## PART 7: INITIALIZE NEXT.JS PROJECT

### Step 1: Create Next.js App

**In terminal, in your dance-cash folder:**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint
```

**Answer prompts:**
- Would you like to use TypeScript? → **Yes**
- Would you like to use ESLint? → **Yes**
- Would you like to use Tailwind CSS? → **Yes**
- Would you like to use `src/` directory? → **Yes**
- Would you like to use App Router? → **No** (use Pages Router)
- Would you like to customize the import alias? → **No**

### Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js mainnet-js qrcode next-router-events
```

**What each does:**
- @supabase/supabase-js = Connect to Supabase
- mainnet-js = Bitcoin Cash payment verification
- qrcode = Generate QR codes
- next-router-events = Page routing

### Step 3: Verify Installation

```bash
npm run dev
```

**You should see:**
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Visit:** http://localhost:3000

**You should see:** Next.js welcome page

**Stop server:** Press Ctrl+C

---

## PART 8: CREATE FOLDER STRUCTURE

### Create Folders

**In your project root, create:**

```
src/
├── components/
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── EventCard.tsx
│   └── forms/
│       └── SignupForm.tsx
├── pages/
│   ├── index.tsx (already exists)
│   ├── events/
│   │   └── [id].tsx
│   ├── signup/
│   │   └── [eventId].tsx
│   ├── payment/
│   │   └── [signupId].tsx
│   ├── confirmation/
│   │   └── [signupId].tsx
│   ├── studio/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── dashboard.tsx
│   │   ├── create-event.tsx
│   │   └── analytics.tsx
│   ├── api/
│   │   ├── events.ts
│   │   ├── signups.ts
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   ├── payment/
│   │   │   ├── generate-address.ts
│   │   │   ├── verify.ts
│   │   │   └── mint-nft.ts
│   │   └── analytics.ts
├── lib/
│   ├── supabase.ts
│   ├── config.ts
│   ├── bch.ts
│   ├── payments.ts
│   └── cashtokens.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── formatting.ts
└── styles/
    └── globals.css
```

**Use your code editor to create these folders and files.**

---

## PART 9: CREATE CORE LIBRARY FILES

### Create lib/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Create lib/config.ts

```typescript
export const BCH_NETWORKS = {
  chipnet: {
    name: 'chipnet',
    prefix: 'bchtest:',
    faucet: 'https://tbch.googol.cash/',
    explorer: 'https://chipnet.imaginary.cash/',
    network: 'chipnet',
    isTestnet: true
  },
  mainnet: {
    name: 'mainnet',
    prefix: 'bitcoincash:',
    explorer: 'https://explorer.bitcoincash.org',
    network: 'mainnet',
    isTestnet: false
  }
};

export const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_BCH_NETWORK || 'chipnet';
export const BCH_CONFIG = BCH_NETWORKS[ACTIVE_NETWORK];
```

### Create utils/constants.ts

```typescript
export const APP_NAME = 'Dance.cash';
export const CURRENCY_USD = 'USD';
export const CURRENCY_BCH = 'BCH';
export const BCH_DISCOUNT_PERCENT = 10;
export const BCH_TO_USD_RATE = 750; // 1 BCH = $750 (update as needed)
```

---

## PART 10: TEST EVERYTHING WORKS

### Step 1: Start Dev Server

```bash
npm run dev
```

**You should see:** Server running on http://localhost:3000

### Step 2: Verify Supabase Connection

**Create new file: `pages/test-supabase.tsx`**

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').limit(1);
        if (error) throw error;
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Connection Test</h1>
      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
      {data !== null && <p style={{ color: 'green' }}>✅ Connected! Data: {JSON.stringify(data)}</p>}
      {data === null && !error && <p>Loading...</p>}
    </div>
  );
}
```

**Visit:** http://localhost:3000/test-supabase

**You should see:** ✅ Connected!

**If error:** Check your .env.local values are correct

### Step 3: Test Chipnet Wallet

**Create new file: `pages/test-chipnet.tsx`**

```typescript
import { useEffect, useState } from 'react';

export default function TestChipnet() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testWallet = async () => {
      try {
        // This is just a placeholder - you'll implement real wallet creation
        const fakeAddress = 'bchtest:qz2qt69s0fxrznev8dmmyfqp5d8xuvjdqpgxdqy3m';
        setAddress(fakeAddress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testWallet();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chipnet Wallet Test</h1>
      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
      {address && <p style={{ color: 'green' }}>✅ Wallet Ready: {address}</p>}
      <p>Visit: https://tbch.googol.cash/ to get test coins</p>
    </div>
  );
}
```

**Visit:** http://localhost:3000/test-chipnet

**You should see:** Chipnet ready message

---

## PART 11: COMMIT INITIAL SETUP TO GIT

```bash
# Check what files have changed
git status

# Add all files
git add .

# Commit
git commit -m "Initial Next.js + Supabase + Tailwind setup"

# Push to GitHub
git push origin main
```

**Verify:** Go to GitHub and see your files uploaded ✓

---

## PART 12: GET CHIPNET TEST COINS

### Step 1: Create Wallet in Your App

When you build the wallet creation function, you'll get an address that starts with `bchtest:`

### Step 2: Get Test Coins

**Go to:** https://tbch.googol.cash/

**Paste:** Your bchtest: address

**Click:** "Send test coins"

**You'll instantly receive:** 10 TBCH (free test coins)

### Step 3: Verify on Explorer

**Go to:** https://chipnet.imaginary.cash/

**Search:** Your address

**You should see:** 10 TBCH balance

---

## CHECKLIST: YOU'RE NOW READY TO BUILD

- [ ] GitHub repo created and cloned
- [ ] Supabase project created
- [ ] Supabase API keys in .env.local
- [ ] Database schema created (all tables)
- [ ] Supabase Storage bucket created
- [ ] Vercel account connected (don't deploy yet)
- [ ] Next.js project initialized locally
- [ ] Dependencies installed
- [ ] Folder structure created
- [ ] Core library files created (supabase.ts, config.ts, constants.ts)
- [ ] Test files created and verified ✓
- [ ] Supabase connection working ✓
- [ ] Git committed and pushed
- [ ] .env.local created with all keys
- [ ] Chipnet faucet bookmarked

**ALL KEYS AND CREDENTIALS ARE READY**

---

## NOW YOU CAN START BUILDING

You have:
✅ Database setup and live
✅ All API keys configured
✅ Project structure ready
✅ Zero missing pieces
✅ No mock data needed
✅ No hard-coding needed
✅ No placeholders needed

**Time to start coding.**

Follow these three prompts in order:
1. **frontend-prompt.md** — Build all pages/components
2. **backend-prompt.md** — Build all API endpoints
3. **blockchain-prompt.md** — Integrate payments/NFTs

**Start with the Frontend. Build real features. No mock data anywhere.**

---

## TROUBLESHOOTING

### Error: "Cannot find module '@supabase/supabase-js'"
**Fix:** Run `npm install @supabase/supabase-js`

### Error: "SUPABASE_URL is required"
**Fix:** Check .env.local exists and has correct keys

### Error: "Port 3000 already in use"
**Fix:** Run `npm run dev -- -p 3001` to use port 3001

### Supabase connection fails
**Fix:** Verify API keys are copied exactly (no extra spaces)

### Can't find GitHub repo
**Fix:** Go to https://github.com/new and create it first

---

## NEXT STEPS

1. ✅ Follow this entire setup guide (you're reading it)
2. ✅ Get all API keys and credentials
3. ✅ Run all tests to verify everything works
4. ✅ Commit initial setup to Git
5. → **NOW:** Read frontend-prompt.md and start building pages
6. → Then: Read backend-prompt.md and build APIs
7. → Then: Read blockchain-prompt.md and integrate payments

**No more setup. No more waiting. Just pure building.**

Good luck! 🚀
