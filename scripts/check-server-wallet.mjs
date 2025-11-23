import { TestNetWallet } from 'mainnet-js';

async function getWalletInfo() {
    const wif = 'cT8jwmx1i8wdoY3dCxzMmXRUwGnw6KnoDJjJ8pGfravBzZ48A3VU';

    const wallet = await TestNetWallet.fromWIF(wif);

    console.log('=== Server Wallet Info (Chipnet) ===');
    console.log('Address:', wallet.cashaddr);
    console.log('WIF:', wif);
    console.log('Balance:', await wallet.getBalance());

    // Note: WIF-based wallets don't have seed phrases
    // You'd need to create a new HD wallet for that

    console.log('\n=== To use in Selene ===');
    console.log('1. Selene may not support chipnet well');
    console.log('2. Recommend switching to mainnet instead');
    console.log('3. Or use Bitcoin.com wallet for chipnet');
}

getWalletInfo();
