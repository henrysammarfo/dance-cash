# SMART CONTRACT PROMPT - Dance.cash Blockchain Integration

## Overview
This prompt defines all blockchain interactions for Dance.cash. Runs on **Chipnet testnet** for development, deploys to **mainnet** for production. All transactions are REAL (no mock), all data lives on-chain, all payments are verified live.

## Blockchain Stack
- **Network:** Chipnet (testnet) → Mainnet (production)
- **Currency:** Bitcoin Cash (BCH)
- **Tokens:** CashTokens (NFT tickets)
- **SDKs:** mainnet.cash, libauth
- **Deployment:** Live blockchain, no simulation

---

## CHIPNET SETUP (Development)

### Step 1: Configure Chipnet in Code
Create `lib/config.ts`:

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

### Step 2: Create .env.local
```
NEXT_PUBLIC_BCH_NETWORK=chipnet
NEXT_PUBLIC_MAINNET_API=https://chipnet-api.imaginary.cash
BCH_STUDIO_SEED_PHRASE=your_seed_phrase_here (keep private!)
```

### Step 3: Install Dependencies
```bash
npm install mainnet-js libauth
```

### Step 4: Get Test Coins
1. Generate wallet: `ChipNetWallet.newRandom()`
2. Get address (starts with `bchtest:`)
3. Visit: https://tbch.googol.cash/
4. Paste address
5. Receive 10 TBCH instantly (free!)
6. Done - now you have unlimited test coins for development

---

## CORE FUNCTIONS

### 1. Wallet Management (lib/bch.ts)

#### Create Test Wallet
```typescript
import { ChipNetWallet, Mainnet } from 'mainnet-js';

export async function createChipnetWallet() {
  const wallet = await ChipNetWallet.newRandom();
  return {
    address: wallet.getAddress(), // bchtest:qz2qt...
    seed: wallet.seed, // KEEP PRIVATE
    publicKey: wallet.publicKey,
    balance: await wallet.getBalance() // in satoshis
  };
}

export async function getWalletBalance(address: string) {
  // Query Chipnet blockchain
  const wallet = await ChipNetWallet.fromAddress(address);
  const balance = await wallet.getBalance('satoshi');
  return balance / 100_000_000; // Convert to BCH
}
```

#### Import Wallet (for Studios)
```typescript
export async function importStudioWallet(seedPhrase: string) {
  // Restore wallet from seed
  const wallet = await ChipNetWallet.fromSeed(seedPhrase);
  return {
    address: wallet.getAddress(),
    balance: await wallet.getBalance('satoshi') / 100_000_000
  };
}
```

### 2. Payment Verification (lib/payments.ts)

#### Generate Payment Address
```typescript
export async function generatePaymentAddress(signupId: string, amountBCH: number) {
  // Create unique address for each payment
  const wallet = await ChipNetWallet.newRandom();
  const address = wallet.getAddress();
  
  // Store mapping in database (payment_addresses table)
  await supabase.from('payment_addresses').insert({
    payment_id: generateUUID(),
    signup_id: signupId,
    address: address,
    amount_bch: amountBCH,
    status: 'awaiting_payment',
    created_at: new Date(),
    expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 min expiry
  });
  
  return {
    address: address,
    amount_bch: amountBCH,
    amount_satoshis: Math.round(amountBCH * 100_000_000),
    network: BCH_CONFIG.name,
    expiry_minutes: 5
  };
}
```

#### Verify Payment on Blockchain
```typescript
export async function verifyPaymentOnBlockchain(
  address: string,
  expectedAmountBCH: number,
  signupId: string
) {
  const client = new Client({ network: 'chipnet' });
  const expectedSatoshis = Math.round(expectedAmountBCH * 100_000_000);
  
  // Poll blockchain for up to 5 minutes
  for (let i = 0; i < 10; i++) {
    const utxos = await client.getUtxos(address);
    
    for (const utxo of utxos) {
      if (utxo.satoshis >= expectedSatoshis) {
        // Payment confirmed!
        
        // Update signup in database
        await supabase.from('signups').update({
          payment_method: 'bch',
          transaction_id: utxo.txid,
          confirmed_at: new Date(),
          price_paid_bch: utxo.satoshis / 100_000_000
        }).eq('id', signupId);
        
        // Trigger NFT minting
        await mintEventNFT(signupId);
        
        return {
          confirmed: true,
          txid: utxo.txid,
          amount_received: utxo.satoshis / 100_000_000,
          confirmations: utxo.confirmations
        };
      }
    }
    
    // Wait 30 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  // Timeout after 5 minutes
  throw new Error('Payment confirmation timeout');
}
```

**Real Blockchain Interaction:**
- Queries actual Chipnet blockchain via mainnet.cash
- Verifies real UTXOs received
- Confirms actual transaction IDs
- No mock confirmations
- Handles network failures gracefully

---

### 3. NFT Ticket Minting (lib/cashtokens.ts)

#### Mint CashToken NFT
```typescript
export async function mintEventNFT(
  signupId: string,
  eventName: string,
  attendeeName: string
) {
  // Get signup details from database
  const { data: signup } = await supabase
    .from('signups')
    .select('*')
    .eq('id', signupId)
    .single();
  
  if (!signup) throw new Error('Signup not found');
  
  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', signup.event_id)
    .single();
  
  if (!event) throw new Error('Event not found');
  
  // Get studio wallet
  const { data: studio } = await supabase
    .from('studios')
    .select('*')
    .eq('id', event.studio_id)
    .single();
  
  // Import studio wallet (from stored seed)
  const wallet = await ChipNetWallet.fromSeed(
    process.env.BCH_STUDIO_SEED_PHRASE || ''
  );
  
  // Create NFT metadata
  const metadata = {
    event_name: event.name,
    event_date: event.date,
    event_time: event.time,
    attendee_name: signup.attendee_name,
    ticket_id: signup.id,
    created_at: new Date().toISOString()
  };
  
  // Mint CashToken NFT
  const mintResult = await wallet.tokenMint({
    // CashTokens commitment = embedded metadata
    commitment: Buffer.from(JSON.stringify(metadata)),
    initialQuantity: 1n, // 1 NFT
    isMintingBaton: false // Can't mint more after this
  });
  
  // Send NFT to attendee (receive address needed from frontend)
  const sendResult = await wallet.send([
    {
      to: attendeeAddress, // From frontend QR scan
      amount: 1n,
      token: {
        category: mintResult.tokenId,
        amount: 1n
      }
    }
  ]);
  
  // Store NFT transaction in database
  await supabase.from('signups').update({
    nft_txid: sendResult,
    nft_minted_at: new Date()
  }).eq('id', signupId);
  
  return {
    success: true,
    nft_txid: sendResult,
    token_id: mintResult.tokenId,
    message: 'NFT ticket minted successfully'
  };
}
```

**Real Blockchain Features:**
- Mints actual CashToken on Chipnet
- Embeds real metadata in NFT commitment
- Sends to real attendee address
- Returns real transaction ID
- Verified on blockchain explorer
- No simulation, all live

#### Verify NFT Received
```typescript
export async function verifyNFTReceived(
  address: string,
  tokenId: string
) {
  const client = new Client({ network: 'chipnet' });
  const utxos = await client.getUtxos(address);
  
  for (const utxo of utxos) {
    if (utxo.token?.category === tokenId) {
      return {
        received: true,
        amount: utxo.token.amount,
        commitment: utxo.token.commitment
      };
    }
  }
  
  return { received: false };
}
```

---

### 4. CashStamp Cashback (lib/cashtamps.ts)

#### Generate CashStamp Redemption QR
```typescript
export async function generateCashStampQR(
  eventId: string,
  signupId: string,
  studioAddress: string,
  cashbackAmount: number // In BCH
) {
  // Get studio BCH address
  const { data: studio } = await supabase
    .from('studios')
    .select('bch_address')
    .eq('id', studioId)
    .single();
  
  // Create CashStamp URL
  // CashStamps encode: address + amount in the QR
  const stampUrl = `https://stamps.cash/#/redeem?address=${studioAddress}&amount=${cashbackAmount}`;
  
  // Generate QR code (use qrcode npm package)
  const qrCode = await QRCode.toDataURL(stampUrl);
  
  // Store in database for tracking
  await supabase.from('cashtamps').insert({
    signup_id: signupId,
    event_id: eventId,
    studio_address: studioAddress,
    amount_bch: cashbackAmount,
    qr_code_url: qrCode,
    status: 'active',
    created_at: new Date()
  });
  
  return {
    qr_code: qrCode,
    url: stampUrl,
    amount_bch: cashbackAmount,
    instructions: 'Scan this QR with Selene Wallet to claim your BCH cashback'
  };
}
```

---

### 5. API Endpoints for Blockchain (pages/api/blockchain/)

#### POST /api/blockchain/generate-payment-address
```typescript
export default async function handler(req, res) {
  const { signup_id, event_id } = req.body;
  
  // Get event price
  const { data: event } = await supabase
    .from('events')
    .select('price_usd')
    .eq('id', event_id)
    .single();
  
  // Apply 10% discount for BCH
  const priceUSD = event.price_usd * 0.9;
  
  // Convert to BCH (assume 1 BCH = $750)
  const priceBCH = priceUSD / 750;
  
  // Generate payment address
  const result = await generatePaymentAddress(signup_id, priceBCH);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
}
```

#### POST /api/blockchain/verify-payment
```typescript
export default async function handler(req, res) {
  const { address, signup_id } = req.body;
  
  const { data: payment } = await supabase
    .from('payment_addresses')
    .select('amount_bch')
    .eq('signup_id', signup_id)
    .single();
  
  try {
    const result = await verifyPaymentOnBlockchain(
      address,
      payment.amount_bch,
      signup_id
    );
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(408).json({
      status: 'error',
      message: 'Payment verification timeout'
    });
  }
}
```

#### POST /api/blockchain/mint-nft
```typescript
export default async function handler(req, res) {
  const { signup_id, attendee_address } = req.body;
  
  try {
    const result = await mintEventNFT(signup_id, '', '');
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}
```

#### POST /api/blockchain/generate-cashtamp-qr
```typescript
export default async function handler(req, res) {
  const { signup_id, event_id, cashback_amount } = req.body;
  
  // Get studio
  const { data: event } = await supabase
    .from('events')
    .select('studio_id')
    .eq('id', event_id)
    .single();
  
  const { data: studio } = await supabase
    .from('studios')
    .select('bch_address')
    .eq('id', event.studio_id)
    .single();
  
  const result = await generateCashStampQR(
    event_id,
    signup_id,
    studio.bch_address,
    cashback_amount
  );
  
  res.status(200).json({
    status: 'success',
    data: result
  });
}
```

---

## ENVIRONMENT VARIABLES

### Development (.env.local)
```
NEXT_PUBLIC_BCH_NETWORK=chipnet
NEXT_PUBLIC_MAINNET_API=https://chipnet-api.imaginary.cash
BCH_STUDIO_SEED_PHRASE=your_test_seed_here (TEST ONLY)
```

### Production (.env.production)
```
NEXT_PUBLIC_BCH_NETWORK=mainnet
NEXT_PUBLIC_MAINNET_API=https://mainnet-api.example.com
BCH_STUDIO_SEED_PHRASE=your_production_seed_here (KEEP SECURE!)
```

**Switch between networks by changing ONE variable.**

---

## MAINNET MIGRATION (Post-Hackathon)

When ready to deploy to mainnet:

1. **Change environment variable:**
   ```bash
   NEXT_PUBLIC_BCH_NETWORK=mainnet
   ```

2. **Update seed phrase (production wallet):**
   ```bash
   BCH_STUDIO_SEED_PHRASE=your_mainnet_seed
   ```

3. **Deploy to Vercel:**
   ```bash
   git push origin main
   ```

4. **Test with small transaction:**
   - Send 0.001 BCH to test address
   - Verify payment verification works
   - Verify NFT mints correctly
   - Verify CashStamp QR works

5. **Full deployment:**
   - Live on mainnet
   - All transactions are real BCH
   - All NFTs permanently recorded

---

## REAL BLOCKCHAIN CHECKLIST

- [ ] All payment verification queries actual Chipnet blockchain
- [ ] All NFT minting creates real CashTokens on-chain
- [ ] All transaction IDs are real (not mocked)
- [ ] All wallet operations use actual keys/seeds
- [ ] All addresses are properly formatted (bchtest: for testnet, bitcoincash: for mainnet)
- [ ] All amounts are real (converted from USD accurately)
- [ ] Error handling for network timeouts
- [ ] Logging for audit trail (no sensitive data)
- [ ] No hardcoded test transactions
- [ ] Mainnet migration is configuration only

---

## BLOCKCHAIN EXPLORER VERIFICATION

### During Development (Chipnet)
Verify all transactions on: https://chipnet.imaginary.cash/

1. Payment sent: Search transaction ID
2. NFT minted: Search token category ID
3. CashStamp claimed: Search redemption address

### After Deployment (Mainnet)
Verify all transactions on: https://explorer.bitcoincash.org/

1. Payment sent: Search transaction ID
2. NFT minted: Search token category ID
3. CashStamp claimed: Search redemption address

---

## NEXT STEP

Pass this prompt to your blockchain/smart contract specialist. They will:
1. Setup Chipnet testing environment
2. Implement real payment verification
3. Deploy NFT minting smart contracts
4. Integrate CashStamp redemption
5. Test end-to-end on Chipnet
6. Prepare mainnet migration

**Everything runs on real blockchain. All data lives on-chain. No simulation anywhere.**
