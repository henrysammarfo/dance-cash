import { TestNetWallet } from 'mainnet-js';
import fs from 'fs';

async function generate() {
    try {
        const wallet = await TestNetWallet.newRandom();
        const address = await wallet.getDepositAddress();
        const content = `WIF: ${wallet.privateKeyWif}\nADDRESS: ${address}`;
        fs.writeFileSync('wallet-details.txt', content);
        console.log('Wallet details written to wallet-details.txt');
    } catch (error) {
        console.error('Error generating wallet:', error);
    }
}

generate();
