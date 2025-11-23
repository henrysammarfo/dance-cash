import { TestNetWallet, Config } from 'mainnet-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

Config.EnforceCashTokenReceiptAddresses = true;

async function checkServerWallet() {
    const wif = process.env.SERVER_WALLET_WIF;
    if (!wif) {
        console.error('SERVER_WALLET_WIF not found in .env.local');
        return;
    }

    try {
        const wallet = await TestNetWallet.fromWIF(wif);
        console.log('Server Wallet Address (property):', wallet.address);
        console.log('Server Wallet Address (getDepositAddress):', await wallet.getDepositAddress());

        const balance = await wallet.getBalance();
        console.log('Balance:', balance);

        if (balance.sat < 1000) {
            console.warn('⚠️ WARNING: Low balance! Might not be enough to mint NFT.');
        } else {
            console.log('✅ Balance looks sufficient.');
        }
    } catch (error) {
        console.error('Error checking wallet:', error);
    }
}

checkServerWallet();
