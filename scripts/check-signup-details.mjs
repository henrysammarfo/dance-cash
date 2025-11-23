import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSignupDetails() {
    const signupId = '898c8a34-0e2b-4dd2-85cd-736e3246f67a';

    console.log('Fetching signup details...\n');

    const { data, error } = await supabase
        .from('signups')
        .select('*')
        .eq('id', signupId)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('=== SIGNUP DETAILS ===');
    console.log('ID:', data.id);
    console.log('Attendee:', data.attendee_name);
    console.log('Email:', data.attendee_email);
    console.log('Created:', data.created_at);
    console.log('\n=== PAYMENT STATUS ===');
    console.log('Confirmed At:', data.confirmed_at || 'NOT CONFIRMED');
    console.log('Payment Method:', data.payment_method || 'N/A');
    console.log('Price Paid (USD):', data.price_paid_usd || 'N/A');
    console.log('Price Paid (BCH):', data.price_paid_bch || 'N/A');
    console.log('Transaction ID:', data.transaction_id || 'N/A');
    console.log('\n=== NFT STATUS ===');
    console.log('NFT TXID:', data.nft_txid || 'NOT MINTED');

    if (data.nft_txid && data.nft_txid.startsWith('error_')) {
        console.log('\n⚠️  NFT MINTING ERROR DETECTED:');
        console.log('Error Message:', data.nft_txid.replace('error_', ''));
    } else if (data.nft_txid) {
        console.log('✅ NFT Successfully Minted!');
        console.log('Explorer:', `https://chipnet.chaingraph.cash/tx/${data.nft_txid}`);
    }

    console.log('\n=== CASHSTAMP STATUS ===');
    console.log('CashStamp ID:', data.cashtamp_id || 'NOT CREATED');
}

checkSignupDetails();
