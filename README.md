# Dance Cash - Bitcoin Cash Event Booking Platform

A "Masterclass" quality event booking platform for dance studios, featuring Bitcoin Cash (BCH) payments, NFT tickets, and cashback rewards.

## 🌟 Features

### For Dancers
- **Browse Events**: Discover workshops, masterclasses, and festivals with a premium UI.
- **Book with Crypto**: Pay with Bitcoin Cash (BCH) for a 10% discount or use Fiat.
- **NFT Tickets**: Receive unique CashToken NFT tickets upon booking.
- **Cashback Rewards**: Scan CashStamp QR codes at events to earn BCH cashback.
- **Responsive Design**: Fully optimized for mobile and desktop.

### For Studios
- **Studio Dashboard**: Manage events, track revenue, and view signups.
- **Create Events**: Publish new classes and workshops with image uploads.
- **Analytics**: Real-time insights into your studio's performance.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage)
- **Blockchain**: `mainnet-js` (BCH Chipnet Testnet)
- **State Management**: React Hook Form, Zod

## 🛠️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd dance-cash/frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the `frontend` directory with the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    NEXT_PUBLIC_BCH_NETWORK=chipnet
    NEXT_PUBLIC_MAINNET_API=https://api.mainnet.cash
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## ⛓️ Blockchain Integration

This project uses **Bitcoin Cash (BCH)** and **CashTokens** on the **Chipnet** testnet.

### How it Works
1.  **Wallet Creation**: We use `mainnet-js` to generate a unique, temporary wallet for each payment session. This allows us to monitor the blockchain for incoming transactions specifically for that booking.
2.  **Payment Monitoring**: The application polls the blockchain to detect when the correct amount of BCH is sent to the generated address.
3.  **NFT Minting**: Upon successful payment, the system automatically mints a **CashToken NFT** representing the ticket and sends it to the user's wallet (e.g., Selene Wallet).
4.  **No Smart Contracts**: For this MVP, we utilize the native token capabilities of Bitcoin Cash (CashTokens) without needing complex custom smart contracts. The logic is handled via the `mainnet-js` library interacting directly with the blockchain.

## 🎨 UI/UX Design

Inspired by "Masterclass" and modern dance platforms:
- **Dark/Light Mode**: Toggle between themes for your preferred viewing experience.
- **Immersive Visuals**: High-quality video backgrounds and animated interactions.
- **Clean Typography**: Focus on readability and elegance.

## 📄 License

This project is open-source and available under the MIT License.
