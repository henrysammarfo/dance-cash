import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TestNetWallet, Wallet, Config } from 'mainnet-js';
import { generateCashStampQR } from '@/lib/cashtamps';

// Initialize Supabase client with Service Role Key for admin privileges (bypassing RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const { address, signupId } = await request.json();

        if (!address || !signupId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Import mainnet-js to check the blockchain
        const { TestNetWallet, Wallet } = await import('mainnet-js');

        const network = process.env.NEXT_PUBLIC_BCH_NETWORK || 'chipnet';
        const WalletClass = network === 'mainnet' ? Wallet : TestNetWallet;

        // Create a wallet instance to check the address balance
        const wallet = await WalletClass.watchOnly(address);
        const balance = await wallet.getBalance('bch');

        // Get the expected amount from the database
        const { data: paymentAddress, error: fetchError } = await supabase
            .from('payment_addresses')
            .select('amount_bch, wif')
            .eq('address', address)
            .eq('signup_id', signupId)
            .single();

        if (fetchError || !paymentAddress) {
            return NextResponse.json(
                { error: 'Payment address not found' },
                { status: 404 }
            );
        }

        const expectedAmount = paymentAddress.amount_bch;
        const confirmed = balance >= expectedAmount;

        if (confirmed) {
            // Fetch event to get price_usd and event_name
            const { data: signup } = await supabase
                .from('signups')
                .select('event_id')
                .eq('id', signupId)
                .single();

            const { data: eventData } = await supabase
                .from('events')
                .select('price_usd, name')
                .eq('id', signup?.event_id)
                .single();

            // Update the signup to confirmed
            const { error: updateError } = await supabase
                .from('signups')
                .update({
                    confirmed_at: new Date().toISOString(),
                    payment_method: 'bch',
                    price_paid_bch: balance,
                    price_paid_usd: eventData?.price_usd || 0,
                    event_name: eventData?.name || 'Unknown Event',
                })
                .eq('id', signupId);

            if (updateError) {
                console.error('Error updating signup:', updateError);
                throw updateError;
            }

            // Fetch signup and event for NFT minting and email
            const { data: signupFull } = await supabase
                .from('signups')
                .select('*')
                .eq('id', signupId)
                .single();

            if (signupFull) {
                const { data: event } = await supabase
                    .from('events')
                    .select('name, date, start_time, location, studio_id, banner_url, studio:studios(bch_address)')
                    .eq('id', signupFull.event_id)
                    .single();

                if (event) {
                    // Mint Real On-Chain NFT Ticket using BCH CashTokens
                    try {
                        const tempWallet = await WalletClass.fromWIF(paymentAddress.wif);

                        console.log('=== NFT MINTING START ===');
                        console.log('Signup ID:', signupId);

                        const commitment = signupId.replace(/-/g, '');
                        console.log('Commitment (hex):', commitment);

                        const genesisResponse = await tempWallet.tokenGenesis({
                            cashaddr: address,
                            amount: BigInt(1),
                            value: 1000,
                            capability: 'none',
                            commitment: commitment,
                        }) as any;

                        console.log('NFT Genesis Response:', genesisResponse);
                        console.log('=== NFT MINTING SUCCESS ===');

                        const txId = genesisResponse.txId || genesisResponse.tokenId;

                        await supabase
                            .from('signups')
                            .update({
                                nft_txid: txId,
                                transaction_id: txId
                            })
                            .eq('id', signupId);

                        console.log('Real on-chain NFT minted and sent:', txId);

                        // Sweep REMAINING funds to Studio Wallet
                        try {
                            const studioAddress = (event as any)?.studio?.bch_address;

                            if (studioAddress) {
                                console.log(`Sweeping remaining funds to studio: ${studioAddress}`);
                                await tempWallet.sendMax(studioAddress);
                                console.log('Funds swept successfully');
                            } else {
                                console.warn('No studio address found to sweep funds to');
                            }
                        } catch (sweepError) {
                            console.error('Error sweeping funds:', sweepError);
                        }

                    } catch (nftError: any) {
                        console.error('=== NFT MINTING FAILED ===');
                        console.error('Error minting on-chain NFT:', nftError);

                        const errorMsg = nftError?.message || nftError?.toString() || 'Unknown error';
                        await supabase
                            .from('signups')
                            .update({
                                nft_txid: `error_${errorMsg.substring(0, 50)}`,
                            })
                            .eq('id', signupId);

                        // Try to sweep funds even if minting failed
                        try {
                            const tempWallet = await WalletClass.fromWIF(paymentAddress.wif);
                            const studioAddress = (event as any)?.studio?.bch_address;
                            if (studioAddress) {
                                await tempWallet.sendMax(studioAddress);
                            }
                        } catch (e) { console.error('Sweep failed after mint error', e); }
                    }

                    // Create CashStamp Reward
                    try {
                        const cashStampAmount = Number(balance) * 0.1;
                        const { generateCashStampQR } = await import('@/lib/cashtamps');

                        const cashStamp = await generateCashStampQR(
                            event.studio_id,
                            cashStampAmount
                        );

                        await supabase
                            .from('cashtamps')
                            .insert({
                                signup_id: signupId,
                                qr_code_data: cashStamp.qrCodeUrl,
                                amount_bch: cashStampAmount,
                                claimed: false,
                            });

                        console.log('CashStamp created:', cashStamp.id);
                    } catch (cashStampError) {
                        console.error('Error creating CashStamp:', cashStampError);
                    }

                    // Send confirmation email
                    try {
                        if (signupFull.attendee_email) {
                            const { sendConfirmationEmail } = await import('@/lib/email');
                            const emailResult = await sendConfirmationEmail({
                                to: signupFull.attendee_email,
                                attendeeName: signupFull.attendee_name,
                                eventName: event.name,
                                eventDate: event.date,
                                eventTime: event.start_time || 'TBD',
                                eventLocation: event.location,
                                nftTxid: (await supabase.from('signups').select('nft_txid').eq('id', signupId).single()).data?.nft_txid,
                                network: process.env.NEXT_PUBLIC_BCH_NETWORK || 'chipnet',
                            });

                            if (emailResult.success) {
                                console.log('Confirmation email sent successfully');
                            } else {
                                console.warn('Failed to send confirmation email:', emailResult.error);
                            }
                        } else {
                            console.log('No email address provided, skipping confirmation email');
                        }
                    } catch (emailError) {
                        console.error('Error sending confirmation email:', emailError);
                    }
                }
            }
        }

        return NextResponse.json({
            confirmed,
            balance,
            expectedAmount,
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
