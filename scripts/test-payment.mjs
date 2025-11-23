import { TestNetWallet } from 'mainnet-js';

async function testPaymentFlow() {
    try {
        console.log('=== BCH Payment & NFT Minting Test ===\n');

        // Your test wallet WIF (replace with your actual chipnet wallet WIF)
        const userWif = 'cT8jwmx1i8wdoY3dCxzMmXRUwGnw6KnoDJjJ8pGfravBzZ48A3VU'; // REPLACE THIS

        const userWallet = await TestNetWallet.fromWIF(userWif);

        console.log('User Wallet Address:', userWallet.cashaddr);
        console.log('User Wallet Balance:', await userWallet.getBalance(), 'BCH\n');

        // Get payment address from your app (you'll paste this)
        const paymentAddress = process.argv[2]; // Pass as command line argument
        const amountBch = parseFloat(process.argv[3] || '0.0001'); // Amount to pay

        if (!paymentAddress) {
            console.log('Usage: node test-payment.mjs <payment_address> <amount_bch>');
            console.log('Example: node test-payment.mjs bchtest:qr... 0.0001');
            return;
        }

        console.log('Payment Address:', paymentAddress);
        console.log('Amount to Pay:', amountBch, 'BCH\n');

        // Send payment
        console.log('Sending payment...');
        const txid = await userWallet.send([
            {
                cashaddr: paymentAddress,
                value: amountBch,
                unit: 'bch'
            }
        ]);

        console.log('✅ Payment sent!');
        console.log('Transaction ID:', txid);
        console.log('Explorer:', `https://chipnet.chaingraph.cash/tx/${txid}\n`);

        // Wait for confirmation
        console.log('Waiting 30 seconds for payment detection and NFT minting...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Check if NFT was received
        console.log('Checking for NFT in your wallet...');

        // Get all UTXOs to check for tokens
        const utxos = await userWallet.getAddressUtxos(userWallet.cashaddr);

        console.log('\nUTXOs in wallet:');
        utxos.forEach((utxo, i) => {
            console.log(`\nUTXO ${i + 1}:`);
            console.log('  Amount:', utxo.satoshis, 'sats');
            if (utxo.token) {
                console.log('  🎫 TOKEN FOUND!');
                console.log('  Token ID:', utxo.token.tokenId);
                console.log('  Amount:', utxo.token.amount);
                console.log('  Capability:', utxo.token.capability);
                if (utxo.token.commitment) {
                    console.log('  Commitment:', utxo.token.commitment);
                    try {
                        const metadata = JSON.parse(Buffer.from(utxo.token.commitment, 'hex').toString());
                        console.log('  Metadata:', JSON.stringify(metadata, null, 2));
                    } catch (e) {
                        console.log('  (Could not parse metadata)');
                    }
                }
            }
        });

        console.log('\n=== Test Complete ===');
        console.log('Check explorer for NFT transaction:');
        console.log(`https://chipnet.chaingraph.cash/address/${userWallet.cashaddr}`);

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    }
}

testPaymentFlow();
