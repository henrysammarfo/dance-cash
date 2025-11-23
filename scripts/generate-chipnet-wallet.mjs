import { TestNetWallet } from 'mainnet-js';

async function generateChipnetAddress() {
    try {
        // Generate a new chipnet wallet
        const wallet = await TestNetWallet.newRandom();

        console.log('=== CHIPNET WALLET FOR BLAZE SUBMISSION ===\n');
        console.log('Chipnet Address:', wallet.getDepositAddress());
        console.log('Token Address:', wallet.getTokenDepositAddress());
        console.log('\nSeed Phrase (SAVE THIS SECURELY):');
        console.log(wallet.mnemonic);
        console.log('\n===========================================');
        console.log('\nIMPORTANT: Save your seed phrase somewhere safe!');
        console.log('You can import this wallet into Cashonize or Paytaca later.');
    } catch (error) {
        console.error('Error generating wallet:', error);
    }
}

generateChipnetAddress();
