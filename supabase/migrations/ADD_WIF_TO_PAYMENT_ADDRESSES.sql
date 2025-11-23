-- Add WIF column to payment_addresses to store private keys for temporary wallets
ALTER TABLE public.payment_addresses ADD COLUMN wif TEXT;

-- Add comment explaining security implication (in production, this should be encrypted)
COMMENT ON COLUMN public.payment_addresses.wif IS 'Wallet Import Format (Private Key) for the temporary payment wallet. Required to sweep funds.';
