import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { TestNetWallet, Wallet } from 'mainnet-js';
import { ACTIVE_NETWORK } from '@/lib/config';
import { mintEventNFT } from '@/lib/cashtokens';
import { generateCashStampQR } from '@/lib/cashtamps';

export async function POST(request: Request) {
    try {
        const { address, signupId } = await request.json();

        if (!address || !signupId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check database first to see if already confirmed
        const { data: existing } = await supabase
            .from('signups')
            .select('status')
            .eq('id', signupId)
            .single();

        if (existing?.status === 'confirmed') {
            return NextResponse.json({ confirmed: true });
        }

        // Check blockchain
        // We need to reconstruct the wallet to check balance/history
        // In a real app, we'd track xpub or import the specific address to a watch-only wallet
        // For this MVP, we'll just check the address balance using a watch-only wallet instance
        const wallet = ACTIVE_NETWORK === 'chipnet'
            ? await TestNetWallet.watchOnly(address)
            : await Wallet.watchOnly(address);

        const balance = Number(await wallet.getBalance('bch'));

        // Get expected amount
        const { data: paymentAddr } = await supabase
            .from('payment_addresses')
            .select('amount_bch')
            .eq('address', address)
            .single();

        if (!paymentAddr) {
            return NextResponse.json({ error: 'Payment address not found' }, { status: 404 });
        }

        // Allow for small variance or just check if > 0 for testnet ease
        if (balance >= paymentAddr.amount_bch) {
            // Payment Confirmed!

            // 1. Update Signup Status
            await supabase
                .from('signups')
                .update({
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString(),
                    price_paid_bch: balance,
                    payment_method: 'bch'
                })
                .eq('id', signupId);

            // 2. Mint NFT
            // We need the event name for metadata
            const { data: signupData } = await supabase
                .from('signups')
                .select('*, events(name)')
                .eq('id', signupId)
                .single();

            const nft = await mintEventNFT(address, signupData?.events?.name || 'Event Ticket');

            await supabase
                .from('signups')
                .update({ nft_txid: nft.txId })
                .eq('id', signupId);

            // 3. Generate CashStamp
            // We need studio address
            // For now, use a placeholder or fetch from event->studio
            const cashstamp = await generateCashStampQR('bchtest:studio_address', balance * 0.05); // 5% cashback

            await supabase
                .from('cashtamps')
                .insert({
                    signup_id: signupId,
                    qr_code_url: cashstamp.qrCodeUrl,
                    status: 'active',
                    amount_bch: balance * 0.05
                });

            return NextResponse.json({ confirmed: true });
        }

        return NextResponse.json({ confirmed: false, balance });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
