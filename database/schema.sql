-- 1. Hobbies Table
CREATE TABLE IF NOT EXISTS hobbies (
    id SERIAL PRIMARY KEY,
    hobby_name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Users Table (Syncs with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    phone VARCHAR(20),
    contact_number VARCHAR(20),
    hobbies VARCHAR(100),
    gender VARCHAR(20),
    birthday DATE,
    address TEXT,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to sync auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    contact_number,
    hobbies,
    gender,
    is_banned
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'contact_number'),
    COALESCE(new.raw_user_meta_data->>'contact_number', new.raw_user_meta_data->>'phone'),
    new.raw_user_meta_data->>'hobbies',
    new.raw_user_meta_data->>'gender',
    COALESCE((new.raw_user_meta_data->>'is_banned')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Insert Initial Hobby Data
INSERT INTO hobbies (hobby_name) VALUES 
('Anime Figures'),
('Trading Cards'),
('Vintage Coins'),
('Rare Sneakers'),
('Comic Books'),
('Retro Video Games'),
('Vinyl Records'),
('Antique Watches')
ON CONFLICT (hobby_name) DO NOTHING;

-- 4. Auctions Table
CREATE TABLE IF NOT EXISTS auctions (
    id SERIAL PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starting_bid DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bids Table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    auction_id INT NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_amount DECIMAL(10, 2) NOT NULL,
    bid_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enable Row Level Security
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- 7. Policies

-- Hobbies: Anyone can read
CREATE POLICY "Allow public read access to hobbies" ON hobbies FOR SELECT USING (true);

-- Users: 
-- 1. Read access
CREATE POLICY "Allow users to read data" ON users FOR SELECT USING (true);
-- 2. Users can update their own data
CREATE POLICY "Allow users to update own data" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- 3. Users can create only their own profile if the auth trigger is not used
CREATE POLICY "Allow users to insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Auctions:
-- 1. Anyone can read active auctions
CREATE POLICY "Allow public read access to active auctions" ON auctions FOR SELECT USING (status = 'active');
-- 2. Authenticated users can create auctions
CREATE POLICY "Allow authenticated insert to auctions" ON auctions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- 3. Sellers can update their own auctions
CREATE POLICY "Allow sellers to update own auctions" ON auctions FOR UPDATE USING (auth.uid() = seller_id);

-- Bids:
-- 1. Anyone can read bids
CREATE POLICY "Allow public read access to bids" ON bids FOR SELECT USING (true);
-- 2. Authenticated users can place bids
CREATE POLICY "Allow authenticated insert to bids" ON bids FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 8. RPC function for placing bids (Transaction-like)
-- Set as SECURITY DEFINER to bypass RLS during the bidding logic execution
CREATE OR REPLACE FUNCTION place_bid(
    p_auction_id INT,
    p_bidder_id UUID,
    p_bid_amount DECIMAL
) RETURNS VOID AS $$
DECLARE
    v_current_bid DECIMAL;
    v_end_time TIMESTAMP WITH TIME ZONE;
    v_status VARCHAR;
    v_seller_id UUID;
BEGIN
    -- Get auction details
    SELECT current_bid, end_time, status, seller_id 
    INTO v_current_bid, v_end_time, v_status, v_seller_id
    FROM auctions 
    WHERE id = p_auction_id
    FOR UPDATE; -- Lock the row

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auction not found';
    END IF;

    IF v_seller_id = p_bidder_id THEN
        RAISE EXCEPTION 'You cannot bid on your own auction';
    END IF;

    IF v_status = 'closed' OR v_end_time < NOW() THEN
        RAISE EXCEPTION 'Auction has already ended';
    END IF;

    IF p_bid_amount <= v_current_bid THEN
        RAISE EXCEPTION 'Bid must be higher than the current bid';
    END IF;

    -- Record the bid
    INSERT INTO bids (auction_id, bidder_id, bid_amount)
    VALUES (p_auction_id, p_bidder_id, p_bid_amount);

    -- Update the auction price
    UPDATE auctions 
    SET current_bid = p_bid_amount 
    WHERE id = p_auction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
