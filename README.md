# Dance.cash - Bitcoin Cash Event Booking Platform

> 🏆 **BLAZE Hackathon 2025 Submission** - Dance.cash Bounty Track

A revolutionary event management platform for dance studios, featuring Bitcoin Cash (BCH) payments, NFT tickets, and cashback rewards.

---

## 💰 Support Dance.cash - Vote with Embers!

**BCH Address**: `bitcoincash:qr6cqvvq404nhet97k08f2f89r38rkxgpvcmvtlf2e`

![QR Code](./public/bch-qr.png)

*Send BCH embers to this address to vote for Dance.cash in the BLAZE Community Choice Award!*

---

## 📖 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [BLAZE Bounty Requirements](#blaze-bounty-requirements)
- [Setup & Installation](#setup--installation)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Dance.cash is a BCH-native event management platform specifically designed for the global dance community. We're solving the high-fee, poor-UX problem that dance studios and festival organizers face with traditional platforms like EventBrite and Fatsoma.

**📊 [View Full Presentation](https://docs.google.com/presentation/d/1oUaEpeqvITP-roq7oi7Tu8nsc14xG2j15ScZjEXdLrM/edit?usp=sharing)**

**Built for:** BCH BLAZE Hackathon 2025  
**Developer:** Henry Sammarfo ([@henrysammarfo](https://github.com/henrysammarfo))  
**Repository:** [github.com/henrysammarfo/dance-cash](https://github.com/henrysammarfo/dance-cash)  
**Presentation:** [View Slides](https://docs.google.com/presentation/d/1oUaEpeqvITP-roq7oi7Tu8nsc14xG2j15ScZjEXdLrM/edit?usp=sharing)

---

## 🚨 The Problem

Dance studios currently face:
- **High platform fees**: EventBrite charges 3.5% + $1.79 per ticket
- **Expensive payment processing**: Fiat processors add additional fees
- **Limited engagement**: No tools to build customer loyalty
- **No incentives**: Dancers have no reason to return
- **Poor analytics**: Basic event management features

---

## ✅ The Solution

Dance.cash delivers:
- ✓ **Lower costs** through BCH payments (10% discount for users)
- ✓ **Memorable experiences** with NFT tickets (CashTokens)
- ✓ **Customer retention** via BCH cashback rewards (CashStamps)
- ✓ **Superior tools** with real-time analytics dashboard
- ✓ **BCH adoption** in a vibrant global community

---

## 🌟 Features

### For Dancers (Clients)
- 🎭 **Browse Events**: Discover workshops, masterclasses, and festivals
- 💰 **Dual Payment**: Pay with BCH (10% discount) or fiat (Google/Apple Pay)
- 🎫 **NFT Tickets**: Receive unique CashToken NFT tickets upon booking
- 💸 **Cashback Rewards**: Earn BCH rewards via CashStamp
- 📱 **Mobile Responsive**: Fully optimized for all devices

### For Studios (Organizers)
- 📅 **Event Management**: Create one-time or recurring events
- 🖼️ **Media Upload**: Add event banners and detailed information
- 📊 **Analytics Dashboard**: Track signups, revenue, and performance
- 💵 **Revenue Tracking**: Monitor earnings in real-time
- 🎯 **Lower Fees**: Save money compared to traditional platforms

### For Artists (Teachers)
- 👤 **Profile Pages**: Create professional artist profiles
- 🔗 **Social Links**: Showcase contact and social media
- 🎪 **Event Portfolio**: Display prior events and workshops
- 🤝 **Studio Connections**: Get hired by studios for events

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript, React 18
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod validation

### Backend
- **API**: Next.js API Routes
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Blockchain & Payments
- **BCH Library**: Mainnet-JS
- **Network**: Bitcoin Cash Chipnet (testnet)
- **NFTs**: CashToken minting
- **Rewards**: CashStamp API integration
- **Wallet**: Selene Wallet deep linking
- **Fiat**: Google Pay / Apple Pay integration

---

## 🏆 BLAZE Bounty Requirements

This project fulfills **ALL** Dance.cash Bounty requirements:

### ✅ Core Requirements
- ✓ **Tech Stack**: ReactJS frontend (Next.js), Node.js backend
- ✓ **Responsive**: Fully mobile-responsive design
- ✓ **User Types**: Dancers (clients) and Studios (administrators)

### ✅ Studio Features
- ✓ Create one-off events (e.g., 3-day festivals)
- ✓ Create recurring events (e.g., weekly classes)
- ✓ Upload mobile banners
- ✓ Analytics dashboard with revenue tracking
- ✓ View signups and performance metrics

### ✅ Dancer User Flow
1. ✓ Main events listing page
2. ✓ Event details/landing page with full information
3. ✓ Registration form with local storage
4. ✓ Dual payment options (BCH with discount, fiat via Google/Apple Pay)
5. ✓ Confirmation page with NFT ticket and CashStamp reward

### ✅ BCH Integration
- ✓ Real on-chain CashToken NFTs (chipnet)
- ✓ CashStamp rewards integration
- ✓ Selene Wallet deep linking
- ✓ Automatic NFT delivery on payment

### ✅ Stretch Goals
- ✓ SEO optimization (meta tags, semantic HTML, Open Graph)
- ✓ Artist profiles (third user type)
- ✓ Artist-event linking system

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- BCH chipnet wallet (for testing)

### 1. Clone the Repository
```bash
git clone https://github.com/henrysammarfo/dance-cash.git
cd dance-cash
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# BCH Configuration
NEXT_PUBLIC_BCH_NETWORK=chipnet
NEXT_PUBLIC_MAINNET_API=https://api.mainnet.cash

# Server Wallet (for NFT minting)
SERVER_WALLET_SEED=your_server_wallet_seed_phrase

# CashStamp API
CASHSTAMP_API_KEY=your_cashstamp_api_key
```

### 4. Database Setup
Run the Supabase migrations:

```bash
# Navigate to supabase/migrations folder
# Run each SQL file in order in your Supabase SQL editor
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## ⛓️ How It Works

### Payment Flow
1. **User selects event** and clicks "Book Now"
2. **Registration form** collects name, email, phone
3. **Payment options** displayed (BCH or Fiat)
4. **BCH payment**: 
   - Temporary wallet generated for this booking
   - User sends BCH to generated address
   - System monitors blockchain for payment
5. **Payment confirmed**:
   - Booking saved to database
   - NFT ticket minted and sent to user's wallet
   - CashStamp reward generated
6. **Confirmation page** displays:
   - Event details
   - NFT Token ID with blockchain explorer link
   - CashStamp QR code for reward
   - Selene Wallet download links

### NFT Ticket System
- Each booking generates a unique CashToken NFT
- NFT contains event metadata (name, date, location)
- Sent directly to user's BCH wallet address
- Viewable in Selene Wallet or other CashToken-compatible wallets
- Serves as proof of ticket purchase

### CashStamp Rewards
- Users receive BCH cashback as CashStamp
- Scannable QR code on confirmation page
- Can be redeemed for future event bookings
- Encourages repeat customers and BCH adoption

---

## 📁 Project Structure

```
dance-cash/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── bookings/         # Booking endpoints
│   │   ├── events/           # Event endpoints
│   │   ├── studios/          # Studio endpoints
│   │   └── verify-payment/   # Payment verification
│   ├── artists/              # Artist pages
│   ├── events/               # Event pages
│   ├── signup/               # Signup flow
│   ├── studio/               # Studio dashboard
│   └── confirmation/         # Booking confirmation
├── components/               # React components
│   ├── auth/                 # Authentication forms
│   ├── forms/                # Form components
│   ├── studio/               # Studio components
│   └── ui/                   # Shadcn UI components
├── lib/                      # Utility libraries
│   ├── cashtokens.ts         # NFT minting logic
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Helper functions
├── scripts/                  # Utility scripts
│   ├── generate-wallet.mjs   # Wallet generation
│   └── check-balance.mjs     # Balance checking
├── supabase/                 # Database migrations
│   └── migrations/           # SQL migration files
├── public/                   # Static assets
│   └── logo.png              # Project logo
└── types/                    # TypeScript types
```

---

## 🎨 Design Philosophy

Inspired by premium platforms like Masterclass:
- **Dark/Light Mode**: Seamless theme switching
- **Immersive Visuals**: High-quality imagery and animations
- **Clean Typography**: Focus on readability and elegance
- **Mobile-First**: Optimized for all screen sizes
- **Smooth Interactions**: Framer Motion animations

---

## 🤝 Contributing

This project was built for the BCH BLAZE Hackathon 2025. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**Henry Sammarfo**
- GitHub: [@henrysammarfo](https://github.com/henrysammarfo)
- Twitter: [@henrysammarfo](https://twitter.com/henrysammarfo)
- Telegram: [BCH Podcast](https://t.me/BitcoinCashPodcast)

**Project Link**: [https://github.com/henrysammarfo/dance-cash](https://github.com/henrysammarfo/dance-cash)

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙏 Acknowledgments

- **BCH BLAZE Hackathon** for the opportunity
- **Jeremy (BCH Podcast)** for the Dance.cash bounty concept
- **Bitcoin Cash community** for support and tools
- **Mainnet-JS, CashStamp, Selene Wallet** for excellent BCH tools

---

**Built with ❤️ for the BCH BLAZE Hackathon 2025**
