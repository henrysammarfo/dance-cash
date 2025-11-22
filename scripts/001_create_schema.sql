-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create studios table (linked to auth.users)
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID REFERENCES studios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  price_bch NUMERIC,
  price_fiat NUMERIC,
  max_spots INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create signups table
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guest checkout
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  ticket_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signup_id UUID REFERENCES signups(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL, -- 'BCH' or 'USD'
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for Studios
CREATE POLICY "Public studios are viewable by everyone" ON studios
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own studio profile" ON studios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own studio profile" ON studios
  FOR UPDATE USING (auth.uid() = id);

-- Policies for Events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Studios can insert their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = studio_id);

CREATE POLICY "Studios can update their own events" ON events
  FOR UPDATE USING (auth.uid() = studio_id);

CREATE POLICY "Studios can delete their own events" ON events
  FOR DELETE USING (auth.uid() = studio_id);

-- Policies for Signups
CREATE POLICY "Studios can view signups for their events" ON signups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = signups.event_id
      AND events.studio_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own signups" ON signups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create a signup" ON signups
  FOR INSERT WITH CHECK (true);

-- Policies for Payments
CREATE POLICY "Studios can view payments for their events" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM signups
      JOIN events ON signups.event_id = events.id
      WHERE signups.id = payments.signup_id
      AND events.studio_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM signups
      WHERE signups.id = payments.signup_id
      AND signups.user_id = auth.uid()
    )
  );
