-- Run this once in the Supabase SQL editor for an existing database.
-- It aligns public.users with the React app's Supabase Auth registration flow.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'buyer',
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

UPDATE public.users
SET role = 'buyer'
WHERE role IS NULL;

UPDATE public.users
SET is_banned = false
WHERE is_banned IS NULL;

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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    contact_number = EXCLUDED.contact_number,
    hobbies = EXCLUDED.hobbies,
    gender = EXCLUDED.gender,
    is_banned = EXCLUDED.is_banned;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to update own data" ON public.users;
CREATE POLICY "Allow users to update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.users;
CREATE POLICY "Allow users to insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END $$;
