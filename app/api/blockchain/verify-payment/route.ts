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
            // Update the signup to confirmed
            const { error: updateError } = await supabase
                .from('signups')
                .update({
                    confirmed_at: new Date().toISOString(),
                    payment_method: 'bch',
                    price_paid_bch: balance,
                })
                .eq('id', signupId);

            if (updateError) {
                console.error('Error updating signup:', updateError);
                throw updateError;
            }

            // Sweep funds to Studio Wallet
            if (paymentAddress.wif) {
                try {
                    // Fetch studio address via event
                    const { data: signupData } = await supabase
                        .from('signups')
                        .select('event:events(studio:studios(bch_address))')
                        .eq('id', signupId)
                        .single();

                    const studioAddress = (signupData as any)?.event?.studio?.bch_address;

                    if (studioAddress) {
                        console.log(`Sweeping funds to studio: ${studioAddress}`);
                        const tempWallet = await WalletClass.fromWIF(paymentAddress.wif);
                        await tempWallet.sendMax(studioAddress);
                        console.log('Funds swept successfully');
                    } else {
                        console.warn('No studio address found to sweep funds to');
                    }
                } catch (sweepError) {
                    console.error('Error sweeping funds:', sweepError);
                    // Continue execution - don't fail the user's confirmation just because sweep failed
                }
            }

            // Get event details for NFT metadata
            const { data: signup } = await supabase
                .from('signups')
                .select('event_id, attendee_name, attendee_email')
                .eq('id', signupId)
                .single();

            if (signup) {
                const { data: event } = await supabase
                    .from('events')
                    .select('name, date, location, studio_id, banner_url')
                    .eq('id', signup.event_id)
                    .single();

                if (event) {
                    // Mint Real On-Chain NFT Ticket using BCH CashTokens
                    try {
                        const serverWif = process.env.SERVER_WALLET_WIF;
                        if (!serverWif) {
                            throw new Error('SERVER_WALLET_WIF not configured');
                        }

                        const serverWallet = await WalletClass.fromWIF(serverWif);

                        // Create minimal NFT metadata (CashToken commitment limit is 40 bytes)
                        // Use short field names and truncate values to fit
                        const nftMetadata = {
                            e: event.name.substring(0, 15), // Event name (max 15 chars)
                            a: signup.attendee_name.split(' ')[0], // First name only
                        };

                        const commitment = Buffer.from(JSON.stringify(nftMetadata)).toString('hex');

                        // Create CashToken NFT genesis
                        const serverAddress = await serverWallet.getDepositAddress();
                        const genesisResponse = await serverWallet.tokenGenesis({
                            cashaddr: serverAddress,
                            amount: BigInt(1), // 1 NFT
                            value: 1000, // 1000 sats for the UTXO
                            capability: 'none', // NFT with no minting capability
                            commitment: commitment,
                        });

                        console.log('NFT Genesis Response:', genesisResponse);

                        // Get the token ID from the genesis transaction
                        const tokenId = genesisResponse.tokenIds[0];

                        // Send the NFT to the user's address (the address they paid from)
                        const userAddress = address;

                        const sendResponse = await serverWallet.send([
                            {
                                cashaddr: userAddress,
                                value: 1000, // 1000 sats
                                tokenId: tokenId,
                                amount: BigInt(1), // Send 1 NFT
                            } as any
                        ]);

                        console.log('NFT sent to user:', sendResponse);

                        // Store the real NFT transaction ID
                        await supabase
                            .from('signups')
                            .update({
                                nft_txid: sendResponse.txId,
                                transaction_id: sendResponse.txId
                            })
                            .eq('id', signupId);

                        console.log('Real on-chain NFT minted and sent:', sendResponse.txId);
                    } catch (nftError: any) {
                        console.error('Error minting on-chain NFT:', nftError);
                        console.error('NFT Error details:', nftError.message, nftError.stack);
                        // Store error for debugging
                        const errorMsg = nftError?.message || nftError?.toString() || 'Unknown error';
                        await supabase
                            .from('signups')
                            .update({
                                nft_txid: `error_${errorMsg.substring(0, 50)}`,
                            })
                            .eq('id', signupId);
                    }

                    // Create CashStamp Reward
                    try {
                        const cashStampAmount = balance * 0.1; // 10% cashback
                        const { generateCashStampQR } = await import('@/lib/cashtamps');

                        const cashStamp = await generateCashStampQR(
                            event.studio_id,
                            cashStampAmount
                        );

                        // Store CashStamp in database
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
