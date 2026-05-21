-- ============================================================
-- PASTE THIS ENTIRE SCRIPT INTO YOUR SUPABASE SQL EDITOR
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- 1. Add missing columns to users table (if they don't exist)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. Allow admins to see ALL auctions (not just active ones they own)
DROP POLICY IF EXISTS "Admins can view all auctions" ON public.auctions;
CREATE POLICY "Admins can view all auctions" ON public.auctions
  FOR SELECT
  USING (public.check_is_admin());

-- 3. Enable RLS on bids table (in case it's disabled)
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- 4. Allow users to view their own bids (needed for History page)
DROP POLICY IF EXISTS "Users can view own bids" ON public.bids;
CREATE POLICY "Users can view own bids" ON public.bids
  FOR SELECT
  USING (auth.uid() = bidder_id);

-- 5. Allow users to place bids
DROP POLICY IF EXISTS "Users can insert bids" ON public.bids;
CREATE POLICY "Users can insert bids" ON public.bids
  FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- 6. Allow sellers to see bids on their own auctions
DROP POLICY IF EXISTS "Sellers can view bids on their auctions" ON public.bids;
CREATE POLICY "Sellers can view bids on their auctions" ON public.bids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auctions
      WHERE auctions.id = bids.auction_id
        AND auctions.seller_id = auth.uid()
    )
  );

-- 7. Allow admins to view ALL bids
DROP POLICY IF EXISTS "Admins can view all bids" ON public.bids;
CREATE POLICY "Admins can view all bids" ON public.bids
  FOR SELECT
  USING (public.check_is_admin());

-- 8. Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify everything applied
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename IN ('auctions', 'bids', 'users')
ORDER BY tablename, cmd;
