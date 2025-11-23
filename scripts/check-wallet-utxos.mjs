import { TestNetWallet, Config } from 'mainnet-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

Config.EnforceCashTokenReceiptAddresses = true;

async function checkServerWalletUTXOs() {
    const wif = process.env.SERVER_WALLET_WIF;
    if (!wif) {
        console.error('SERVER_WALLET_WIF not found in .env.local');
        return;
    }

    try {
        const wallet = await TestNetWallet.fromWIF(wif);
        const address = await wallet.getDepositAddress();
        console.log('Server Wallet Address:', address);

        const balance = await wallet.getBalance();
        console.log('\n=== BALANCE ===');
        console.log('BCH:', balance.bch);
        console.log('Satoshis:', balance.sat);
        console.log('USD:', balance.usd);

        // Get UTXOs
        const utxos = await wallet.getAddressUtxos();
        console.log('\n=== UTXOs ===');
        console.log('Total UTXOs:', utxos.length);

        utxos.forEach((utxo, i) => {
            console.log(`\nUTXO ${i + 1}:`);
            console.log('  TX ID:', utxo.txid);
            console.log('  Vout:', utxo.vout);
            console.log('  Satoshis:', utxo.satoshis);
            console.log('  Height:', utxo.height);
            if (utxo.token) {
                console.log('  Token:', utxo.token);
            }
        });

        console.log('\n=== ANALYSIS ===');
        const hasVout0 = utxos.some(u => u.vout === 0);
        console.log('Has UTXO with vout=0?', hasVout0 ? 'YES ✅' : 'NO ❌');

        if (!hasVout0) {
            console.log('\n⚠️  ISSUE IDENTIFIED:');
            console.log('The wallet has no UTXOs with vout=0.');
            console.log('CashToken minting requires a UTXO with vout=0.');
            console.log('\nSOLUTION: Send BCH to yourself to create a new UTXO with vout=0.');
        }

    } catch (error) {
        console.error('Error checking wallet:', error);
    }
}

checkServerWalletUTXOs();
