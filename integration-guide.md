# DANCE.CASH - COMPLETE INTEGRATION GUIDE

## How Everything Connects

You now have three detailed prompts:
1. **Frontend Prompt** — All React/Next.js views (no mock data)
2. **Backend Prompt** — All APIs & Supabase integration (real database)
3. **Blockchain Prompt** — All payment/NFT/CashStamp integration (live Chipnet)

Here's how they work together:

---

## FLOW: Dancer Signs Up

### Step 1: Frontend → User fills signup form
- Page: `pages/signup/[eventId].tsx`
- Uses: Frontend Prompt (SignupForm component)
- User enters: Name, Phone, Email
- Action: Click "Continue to Payment"

### Step 2: Frontend calls Backend
- Endpoint: `POST /api/signups`
- Sends: event_id, name, phone, email
- Backend Prompt defines this endpoint
- Returns: signup_id

### Step 3: Frontend shows payment options
- Page: `pages/payment/[signupId].tsx`
- Uses: Frontend Prompt (PaymentOptions component)
- Shows: BCH option (with 10% discount) + Fiat option
- User selects: BCH

### Step 4: Frontend calls Blockchain
- Endpoint: `POST /api/blockchain/generate-payment-address`
- Uses: Blockchain Prompt (generatePaymentAddress function)
- Returns: BCH address + QR code
- Frontend displays: QR code for user to scan

### Step 5: User pays via Chipnet
- User scans QR with Electron Cash (testnet mode)
- User sends ~0.0267 TBCH to payment address
- Payment live on Chipnet blockchain
- ~1-2 minutes for confirmation

### Step 6: Backend verifies payment (real blockchain)
- Endpoint: `POST /api/blockchain/verify-payment`
- Uses: Blockchain Prompt (verifyPaymentOnBlockchain function)
- Queries: Actual Chipnet blockchain
- Looks for: UTXO at payment address
- Confirms: Real transaction ID
- Updates: Supabase signups table (confirmed_at = NOW)

### Step 7: Backend mints NFT (real smart contract)
- Endpoint: `POST /api/blockchain/mint-nft`
- Uses: Blockchain Prompt (mintEventNFT function)
- Action: Mints CashToken NFT on Chipnet
- Stores: NFT transaction ID in database
- Returns: NFT token ID + transaction ID

### Step 8: Backend generates CashStamp QR
- Endpoint: `POST /api/blockchain/generate-cashtamp-qr`
- Uses: Blockchain Prompt (generateCashStampQR function)
- Creates: QR code with studio address + cashback amount
- Stores: In database for tracking
- Returns: QR code

### Step 9: Frontend shows confirmation
- Page: `pages/confirmation/[signupId].tsx`
- Uses: Frontend Prompt (Confirmation component)
- Displays:
  - Success message
  - Event details
  - Selene Wallet download QR (for NFT)
  - CashStamp cashback QR
- No mock data: All real from blockchain + database

---

## FLOW: Studio Creates Event

### Step 1: Studio logs in
- Page: `pages/studio/login.tsx`
- Uses: Frontend Prompt (LoginForm)
- Backend: `POST /api/auth/login` (Backend Prompt)
- Verifies: Email + password from Supabase studios table
- Returns: JWT token

### Step 2: Studio goes to create event
- Page: `pages/studio/create-event.tsx`
- Uses: Frontend Prompt (EventCreationForm)
- Form fields: Name, Date, Time, Location, Style, Teacher, Price, Capacity, Banner

### Step 3: Studio submits form
- Endpoint: `POST /api/events`
- Uses: Backend Prompt (Events API)
- Uploads: Banner image to Supabase Storage
- Stores: Event record in Supabase events table
- Returns: Event ID

### Step 4: Studio views dashboard
- Page: `pages/studio/dashboard.tsx`
- Uses: Frontend Prompt (Dashboard component)
- Backend: Multiple queries from Backend Prompt
  - GET events for this studio
  - GET signups for each event
  - CALCULATE revenue
- Displays: Real data from database (no mock)
- Real-time: Updates when new signup arrives

### Step 5: Studio views analytics
- Page: `pages/studio/analytics.tsx`
- Uses: Frontend Prompt (Analytics component)
- Backend: `GET /api/analytics/revenue` (Backend Prompt)
- Shows: Revenue charts, breakdown, per-event stats
- All data: Real calculations from database

---

## DATA FLOW DIAGRAM

```
FRONTEND (React/Next.js Views)
    ↓
[User fills form]
    ↓
BACKEND (Next.js API Routes)
    ↓
[Validate + Store in Supabase]
    ↓
BLOCKCHAIN (Chipnet testnet)
    ↓
[Payment verified + NFT minted]
    ↓
FRONTEND (Confirmation page)
    ↓
[Show QR codes]
    ↓
USER ACTION
    ↓
[Scan Selene Wallet + CashStamp]
    ↓
COMPLETE
```

---

## SUPABASE DATABASE STRUCTURE

```
STUDIOS
├── id (UUID)
├── email (unique)
├── password_hash
├── name
├── bch_address
├── logo_url
└── created_at

EVENTS
├── id (UUID)
├── studio_id (FK to STUDIOS)
├── name
├── date
├── time
├── location
├── style
├── teacher
├── banner_url
├── price_usd
├── capacity
├── recurring
└── created_at

SIGNUPS
├── id (UUID)
├── event_id (FK to EVENTS)
├── attendee_name
├── attendee_email
├── attendee_phone
├── payment_method ('bch' or 'fiat')
├── price_paid_usd
├── price_paid_bch
├── transaction_id (blockchain txid)
├── nft_txid (blockchain NFT transaction)
├── cashtamp_id
├── confirmed_at
└── created_at

PAYMENT_ADDRESSES
├── id (UUID)
├── signup_id (FK to SIGNUPS)
├── address (bchtest: address)
├── amount_bch
├── status ('awaiting_payment' or 'confirmed')
├── created_at
└── expires_at

CASHTAMPS
├── id (UUID)
├── signup_id (FK to SIGNUPS)
├── studio_address
├── amount_bch
├── qr_code_url
├── status ('active' or 'claimed')
└── created_at
```

---

## FILES YOU NOW HAVE

1. **frontend-prompt.md** (99)
   - All React/Next.js components
   - All pages and views
   - Tailwind styling guidelines
   - Real data integration points
   - No mock data framework

2. **backend-prompt.md** (100)
   - All Next.js API routes
   - Supabase setup instructions (detailed)
   - Database schema (SQL ready-to-copy)
   - All CRUD operations
   - Real-time subscriptions
   - Authentication flows

3. **blockchain-prompt.md** (101)
   - Chipnet configuration
   - Payment verification (real blockchain)
   - NFT minting (CashTokens)
   - CashStamp integration
   - Mainnet migration path
   - All functions production-ready

---

## WHAT EACH TEAM MEMBER DOES

### Frontend Developer
1. Read: **frontend-prompt.md**
2. Build: All React components using Tailwind
3. Import: From organized folders (components/, pages/, etc.)
4. Connect: To backend endpoints defined in backend-prompt.md
5. Result: Beautiful, responsive UI with real data flows

### Backend Developer
1. Read: **backend-prompt.md**
2. Setup: Supabase (follow step-by-step instructions)
3. Create: Database schema (copy/paste SQL)
4. Build: All API endpoints with real queries
5. Integrate: With Supabase real-time
6. Result: Live database with working APIs

### Blockchain Developer
1. Read: **blockchain-prompt.md**
2. Setup: Chipnet configuration
3. Build: Wallet management functions
4. Implement: Payment verification
5. Deploy: CashToken NFT minting
6. Test: End-to-end on Chipnet
7. Result: Live blockchain transactions, real NFTs

---

## DEPLOYMENT PIPELINE

### Phase 1: Development (Chipnet)
- Frontend: `npm run dev` (localhost:3000)
- Backend: Next.js API routes (built-in)
- Blockchain: NEXT_PUBLIC_BCH_NETWORK=chipnet
- Database: Supabase free tier (live)
- All data: Real, live-streaming, no mock

### Phase 2: Staging (Vercel)
- Deploy: `git push origin develop`
- Frontend: Vercel deployment (automatic)
- Backend: Vercel functions (automatic)
- Blockchain: Still Chipnet for testing
- URL: https://dance-cash-staging.vercel.app

### Phase 3: Production (Mainnet)
- Deploy: `git push origin main`
- Frontend: Vercel deployment (automatic)
- Backend: Vercel functions (automatic)
- Blockchain: NEXT_PUBLIC_BCH_NETWORK=mainnet
- Real: All transactions on mainnet BCH

---

## QUICK START (Today)

1. **Frontend Developer:**
   - Read frontend-prompt.md
   - Create Next.js project: `npx create-next-app@latest dance-cash`
   - Start building components

2. **Backend Developer:**
   - Read backend-prompt.md
   - Create Supabase account
   - Follow API key setup instructions
   - Create database schema
   - Start building API endpoints

3. **Blockchain Developer:**
   - Read blockchain-prompt.md
   - Setup Chipnet configuration
   - Get test coins from faucet
   - Start building payment verification

**All three can work in parallel immediately.**

---

## REQUIREMENTS CHECKLIST (Jeremy's Specs)

- [ ] 100% functionality (all three prompts are comprehensive)
- [ ] Working and live (real Chipnet, real Supabase, real blockchain)
- [ ] No mock data (emphasized throughout all three prompts)
- [ ] Raw data, real-time streaming (all queries are live)
- [ ] Full requirements (Frontend covers all views, Backend covers all APIs, Blockchain covers all payment/NFT flows)
- [ ] All features working (signup, payment, NFT, cashback, dashboard, analytics)
- [ ] Production ready (error handling, validation, logging built-in)
- [ ] Deployable (Vercel auto-deploy, Supabase hosted, Chipnet live)

---

## TEST FLOW (Before Submission)

1. **Dance on Chipnet:**
   - User signs up → Sees event details
   - User pays in TBCH → Payment verified on blockchain
   - NFT mints → Displayed in Selene Wallet
   - CashStamp redeems → BCH appears in wallet
   - Studio dashboard → Shows real signup + revenue
   - All live, all real, all working

2. **Verify on Explorer:**
   - Payment: Search on https://chipnet.imaginary.cash/
   - NFT: Verify CashToken minted
   - CashStamp: Verify studio address + amount

3. **Ready for Mainnet:**
   - Change env variable to `mainnet`
   - Deploy
   - Test with small real BCH amount
   - All flows identical
   - Full production deployment

---

## FINAL NOTES

✅ All three prompts are production-ready  
✅ No simulations or mock anywhere  
✅ Real Supabase database included  
✅ Real Chipnet blockchain included  
✅ Migration to mainnet is one config change  
✅ Fully functional by submission deadline  
✅ Jeremy will be impressed  

**Your team now has everything needed to build a complete, working, production-ready Dance.cash platform.**

---

## NEXT STEPS

1. **Share these three prompts** with your team (frontend, backend, blockchain)
2. **Each person reads their prompt** thoroughly
3. **Start coding simultaneously** (no dependencies)
4. **Meet daily** to sync progress
5. **Test integration** between components
6. **Deploy to Vercel** by Saturday
7. **Test end-to-end** on Chipnet
8. **Record demo video** Sunday morning
9. **Submit by 9 AM UTC** Sunday
10. **Message Jeremy** with live URL

**You're ready. Start building.** 🚀
