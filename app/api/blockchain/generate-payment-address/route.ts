import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TestNetWallet, Wallet } from 'mainnet-js';
import { ACTIVE_NETWORK } from '@/lib/config';

export async function POST(request: Request) {
    try {
        const { signupId, amountBch } = await request.json();

        if (!signupId || !amountBch) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a new wallet for this transaction
        // In a real app, we'd use an HD wallet and derive a child address
        // For this MVP, we'll generate a standalone wallet to keep it simple
        const wallet = ACTIVE_NETWORK === 'chipnet'
            ? await TestNetWallet.newRandom()
            : await Wallet.newRandom();

        const address = wallet.getDepositAddress();
        const wif = wallet.privateKey; // Store private key to sweep funds later

        // Calculate expiration (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Store in Supabase
        const { error } = await supabase
            .from('payment_addresses')
            .insert({
                signup_id: signupId,
                address: address,
                amount_bch: amountBch,
                expires_at: expiresAt.toISOString(),
                wif: wif, // Store WIF
            });

        if (error) throw error;

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Error generating address:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
