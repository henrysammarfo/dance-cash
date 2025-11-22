const { TestNetWallet } = require('mainnet-js');

async function generate() {
    try {
        const wallet = await TestNetWallet.newRandom();
        console.log('--- COPY THESE DETAILS ---');
        console.log('WIF (Private Key):', wallet.privateKeyWif);
        console.log('BCH Address (Fund this):', wallet.address);
        console.log('--------------------------');
    } catch (error) {
        console.error('Error generating wallet:', error);
    }
}

generate();
