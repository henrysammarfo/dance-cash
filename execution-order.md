# SOLO BUILDER - EXECUTION ORDER

## You Are Solo

No team. Just you. Building Dance.cash alone.

**This document tells you the EXACT order to follow — no guessing.**

---

## STEP 1: GET EVERYTHING SET UP (2-3 hours)

**Read:** solo-setup-guide.md (File 104)

**Follow every step:**
1. GitHub repo creation
2. Supabase setup
3. Vercel account
4. .env.local with all API keys
5. Next.js initialization
6. Folder structure
7. Test everything works

**Commit to Git**

**THEN and ONLY THEN move to Step 2**

---

## STEP 2: BUILD FRONTEND (Day 1 evening)

**Read:** frontend-prompt.md (File 99)

**Build in this order:**
1. pages/index.tsx (Landing - Event List)
2. pages/events/[id].tsx (Event Detail)
3. pages/signup/[eventId].tsx (Signup Form)
4. pages/payment/[signupId].tsx (Payment Options)
5. pages/confirmation/[signupId].tsx (Success + QR)

**For Studio Pages:**
6. pages/studio/login.tsx
7. pages/studio/register.tsx
8. pages/studio/dashboard.tsx
9. pages/studio/create-event.tsx
10. pages/studio/analytics.tsx

**Build Components as You Go:**
- components/Layout.tsx
- components/Navigation.tsx
- components/EventCard.tsx
- components/forms/SignupForm.tsx
- etc. (as needed)

**Guidelines:**
- Use real Supabase queries (no mock data)
- Import components from organized folders
- Mobile-first responsive design
- Use Tailwind CSS

**Deploy to Vercel after Day 1**
```bash
git add .
git commit -m "Frontend pages complete"
git push origin main
# Vercel auto-deploys
```

**Status Check:**
- Landing page loads ✓
- Event list shows (empty OK) ✓
- All pages navigate ✓
- Mobile responsive ✓
- Live Vercel URL works ✓

---

## STEP 3: BUILD BACKEND APIs (Day 2 morning)

**Read:** backend-prompt.md (File 100)

**Already done from setup:**
- Supabase database tables created ✓
- API keys in .env.local ✓

**Build API endpoints in this order:**

### Authentication APIs
1. pages/api/auth/register.ts
2. pages/api/auth/login.ts

### Events APIs
3. pages/api/events.ts (GET all + POST create)
4. pages/api/events/[id].ts (GET single)

### Signups APIs
5. pages/api/signups.ts (POST create)
6. pages/api/signups/[id].ts (GET single)

### Payment APIs
7. pages/api/payment/generate-address.ts
8. pages/api/payment/verify.ts
9. pages/api/payment/confirm-fiat.ts

### Analytics APIs
10. pages/api/analytics/revenue.ts
11. pages/api/analytics/events.ts

**Guidelines:**
- Every endpoint queries REAL Supabase database
- No hardcoded test data
- Error handling on every endpoint
- Test locally with Postman or curl

**Connect Frontend to Backend:**
- Update pages to call new APIs
- Test signup flow → creates record in DB
- Test payment page → generates address

**Deploy**
```bash
git add .
git commit -m "Backend APIs complete"
git push origin main
```

**Status Check:**
- Events API returns database records ✓
- Signup creates database entry ✓
- Payment address generates ✓
- All endpoints working ✓

---

## STEP 4: BLOCKCHAIN INTEGRATION (Day 2 evening)

**Read:** blockchain-prompt.md (File 101)

**Build Blockchain Functions:**

### Wallet Management
1. lib/bch.ts - Create test wallet
2. lib/bch.ts - Get wallet balance

### Payment Verification
3. lib/payments.ts - Generate payment address
4. lib/payments.ts - Verify payment on blockchain

### NFT Minting
5. lib/cashtokens.ts - Mint CashToken NFT
6. lib/cashtokens.ts - Verify NFT received

### CashStamp Integration
7. lib/cashtamps.ts - Generate CashStamp QR

### Blockchain API Endpoints
8. pages/api/blockchain/generate-payment-address.ts
9. pages/api/blockchain/verify-payment.ts
10. pages/api/blockchain/mint-nft.ts
11. pages/api/blockchain/generate-cashtamp-qr.ts

**Guidelines:**
- All queries hit REAL Chipnet blockchain (not mocked)
- Payment verification polls actual blockchain
- NFT minting creates real CashTokens
- Test with Chipnet faucet coins (free TBCH)

**Manual Testing:**
1. Generate wallet → Get bchtest: address
2. Get test coins from faucet (https://tbch.googol.cash/)
3. Send test payment → Verify on blockchain
4. Verify NFT mints → Check on explorer

**Deploy**
```bash
git add .
git commit -m "Blockchain integration complete"
git push origin main
```

**Status Check:**
- Wallet generation works ✓
- Test coins received from faucet ✓
- Payment verification queries blockchain ✓
- NFT minting on Chipnet ✓
- All transactions visible on explorer ✓

---

## STEP 5: FULL END-TO-END TESTING (Day 3 morning)

**Test Complete Flow:**

1. User lands on homepage
2. User clicks event → sees detail
3. User clicks signup → enters info
4. User selects BCH payment → sees QR
5. User scans QR with Electron Cash (testnet mode)
6. User sends 0.1 TBCH
7. App verifies on blockchain
8. NFT mints automatically
9. User sees confirmation page
10. User scans Selene Wallet QR
11. User receives NFT ticket
12. User scans CashStamp QR
13. User receives BCH cashback

**Each step must be real:**
- Real database entries ✓
- Real blockchain transactions ✓
- Real NFTs minted ✓
- No mock data anywhere ✓

**Verify on Explorers:**
- Chipnet: https://chipnet.imaginary.cash/
- Search your transaction IDs
- Verify payments and NFTs exist

**Status Check:**
- All pages load without errors ✓
- All API endpoints respond correctly ✓
- All blockchain transactions are real ✓
- Demo works on mobile ✓
- Live on Vercel ✓

---

## STEP 6: RECORD DEMO VIDEO (Day 3 morning)

**Record 2-3 minutes showing:**
1. Landing page with events
2. Click event → detail page
3. Signup form → enter data
4. Payment page → show BCH option
5. Show Vercel URL in browser address bar
6. Show mobile responsiveness
7. Short explanation of what you built

**Tools:**
- OBS (free, for screen recording)
- Loom (free, easy cloud recording)
- QuickTime (Mac) or Snip & Sketch (Windows)

**Export:** MP4 format, upload to YouTube (unlisted)

---

## STEP 7: MIGRATE TO MAINNET (Day 3 morning, 8 AM)

**Change ONE environment variable:**

In `.env.production`:
```
NEXT_PUBLIC_BCH_NETWORK=mainnet
```

**Deploy:**
```bash
git add .
git commit -m "Migrate to mainnet - production ready"
git push origin main
# Vercel auto-deploys
```

**IMPORTANT: ONLY use mainnet after Chipnet testing is 100% complete**

---

## STEP 8: SUBMIT TO DORAHACKS (Day 3, before 11 AM UTC)

**Go to:** https://dorahacks.io/

**Find:** Dance.cash bounty

**Click:** "Submit Solution"

**Fill in:**
- Project name: Dance.cash
- Description: (500 words)
- Tech Stack: Next.js, Supabase, Bitcoin Cash, CashTokens
- GitHub link: your repo
- Demo video: YouTube link
- Live URL: your Vercel URL

**Submit**

**Status:** Submitted ✓

---

## STEP 9: MESSAGE JEREMY (Day 3, after submission)

**Go to:** https://t.me/BitcoinCashPodcast

**Send:**
```
Hey Jeremy! 🚀 Just submitted Dance.cash to BLAZE bounty!

Built complete event booking platform:
- Event listing + signup flow
- BCH payments with 10% discount + NFT tickets
- Studio admin dashboard with analytics
- CashStamp cashback rewards

All live on Chipnet testnet. Ready for mainnet deployment.

Check it out: [your-vercel-url]
GitHub: [your-github-repo]

Looking forward to your feedback!
```

---

## TIMELINE SUMMARY

| When | What | Time |
|------|------|------|
| **TODAY (Friday)** | Follow solo-setup-guide.md | 2-3 hours |
| **Friday Evening** | Start building frontend | 4 hours |
| **Saturday Morning** | Finish frontend + deploy | 4 hours |
| **Saturday Afternoon** | Build all backend APIs | 4 hours |
| **Saturday Evening** | Blockchain integration | 4 hours |
| **Saturday Night** | Manual testing on Chipnet | 2 hours |
| **Sunday 8 AM** | Migrate to mainnet | 1 hour |
| **Sunday 9 AM** | Record demo video | 30 min |
| **Sunday 10 AM** | Submit to DoraHacks | 10 min |
| **Sunday 10:10 AM** | Message Jeremy | 5 min |

**Total coding time: ~21 hours**
**Submit by: 11 AM UTC Sunday**
**Result: 1.0 BCH WIN** 🎉

---

## FILES YOU HAVE

1. **solo-setup-guide.md** (104) ← START HERE
2. frontend-prompt.md (99) ← Then this
3. backend-prompt.md (100) ← Then this
4. blockchain-prompt.md (101) ← Then this
5. integration-guide.md (102) ← Reference
6. team-summary.md (103) ← Reference

---

## KEY PRINCIPLES (REPEAT)

✅ **No Mock Data** — Every query is real  
✅ **No Placeholders** — Every feature complete  
✅ **No Hard-Coding** — Every value from database/blockchain  
✅ **No Simulation** — All blockchain transactions real  
✅ **Production Ready** — Deploy to mainnet with confidence  

---

## YOU'VE GOT THIS

You're solo, but you have:
- Detailed setup instructions
- Complete frontend specification
- Complete backend specification
- Complete blockchain specification
- Integration guide showing how it all works
- Day-by-day timeline

**Nothing is missing. No blockers. No unknowns.**

**Just follow the order, build feature by feature, test end-to-end, and submit.**

---

## FINAL REMINDER

1. Read solo-setup-guide.md FIRST
2. Get all API keys BEFORE coding
3. Follow the execution order (Frontend → Backend → Blockchain)
4. Test on real blockchain (Chipnet)
5. Deploy to Vercel
6. Record demo
7. Submit before 11 AM UTC
8. Message Jeremy
9. Receive 1.0 BCH

**START NOW.** 🚀
