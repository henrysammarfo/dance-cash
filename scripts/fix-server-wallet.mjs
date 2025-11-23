import { TestNetWallet, Config } from 'mainnet-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

Config.EnforceCashTokenReceiptAddresses = true;

async function fixServerWallet() {
    const wif = process.env.SERVER_WALLET_WIF;
    if (!wif) {
        console.error('SERVER_WALLET_WIF not found in .env.local');
        return;
    }

    try {
        const wallet = await TestNetWallet.fromWIF(wif);
        const address = await wallet.getDepositAddress();

        console.log('=== FIXING SERVER WALLET ===\n');
        console.log('Server Wallet Address:', address);

        const balance = await wallet.getBalance();
        console.log('Current Balance:', balance.bch, 'BCH');

        if (balance.sat < 2000) {
            console.error('\n❌ ERROR: Insufficient balance. Need at least 2000 sats.');
            console.error('Please fund the server wallet first.');
            return;
        }

        console.log('\nSending BCH to self to create vout=0 UTXO...');

        // Send most of the balance back to ourselves
        // This will create a new UTXO with vout=0
        const amountToSend = balance.sat - 500; // Keep 500 sats for fee

        const result = await wallet.send([
            {
                cashaddr: address,
                value: amountToSend,
                unit: 'sat'
            }
        ]);

        console.log('\n✅ SUCCESS!');
        console.log('Transaction ID:', result.txId);
        console.log('Explorer:', `https://chipnet.chaingraph.cash/tx/${result.txId}`);
        console.log('\nThe server wallet now has a fresh UTXO with vout=0.');
        console.log('NFT minting should work now!');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    }
}

fixServerWallet();
