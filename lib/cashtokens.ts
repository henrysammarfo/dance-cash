import { TestNetWallet, Wallet, Config } from 'mainnet-js';

// Ensure we use the correct network
Config.EnforceCashTokenReceiptAddresses = true;

export async function mintEventNFT(destinationAddress: string, eventName: string) {
    try {
        // Load server wallet (must be funded!)
        const wif = process.env.SERVER_WALLET_WIF;
        if (!wif) {
            throw new Error('SERVER_WALLET_WIF not defined');
        }

        const wallet = await TestNetWallet.fromWIF(wif);

        console.log(`Minting NFT for ${eventName} to ${destinationAddress}`);

        // Create a new NFT (Genesis)
        // We set the commitment to the event name so it displays in wallets
        const { txId, tokenIds } = await wallet.tokenGenesis({
            cashaddr: destinationAddress,
            amount: 0n, // NFT has 0 fungible amount
            capability: 'none', // Immutable NFT
            commitment: eventName, // Displayed content
        });

        if (!tokenIds || tokenIds.length === 0) {
            throw new Error('Failed to generate token ID');
        }

        return {
            txId,
            tokenId: tokenIds[0]
        };
    } catch (error) {
        console.error('Minting failed:', error);
        throw error;
    }
}
