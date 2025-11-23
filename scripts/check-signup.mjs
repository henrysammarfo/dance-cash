import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Use service role key if available for bypassing RLS, otherwise anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConfirmedSignups() {
    console.log('Checking confirmed signups today...');

    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('signups')
        .select('*, payment_addresses(*)')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching signups:', error);
        return;
    }

    console.log(`Found ${data.length} signups today.`);

    data.forEach((signup, i) => {
        console.log(`\n[${i + 1}] Signup ID: ${signup.id}`);
        console.log(`    Attendee: ${signup.attendee_name}`);
        console.log(`    Confirmed: ${signup.confirmed_at ? 'YES (' + signup.confirmed_at + ')' : 'NO'}`);
        console.log(`    NFT TXID: ${signup.nft_txid}`);
        if (signup.payment_addresses && signup.payment_addresses.length > 0) {
            console.log(`    Payment Address: ${signup.payment_addresses[0].address}`);
            console.log(`    Expected Amount: ${signup.payment_addresses[0].amount_bch}`);
        } else {
            console.log(`    Payment Address: NONE FOUND`);
        }
    });
}

checkConfirmedSignups();
