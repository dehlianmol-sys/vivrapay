/*
# Create HK Wallet account, affiliate, and deposit schema

1. New Tables
- `deposits`: user-owned money requests with amount, lifecycle status, and ten-minute expiry.
- `affiliates`: partner records and aggregate deposit metrics.
- `pre_registrations`: unique phone numbers and referral codes collected before account creation.
- `profiles`: user profile records with a short UID and permanent avatar URL.

2. Modified Tables
- Existing `deposits` and `profiles` tables receive any missing requested columns without removing data.

3. Security
- Enables row-level security on all created tables.
- Signed-in users can only access their own profiles and deposits.
- Signed-in users can read affiliate metrics.
- Signed-in users can create and read pre-registration records.

4. Important Notes
- Deposit status is limited to pending, success, cancelled, or expired.
- A short UID is generated as a four-digit string and remains unique.
*/

CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  total_deposits numeric NOT NULL DEFAULT 0,
  total_pending_deposits numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pre_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  ref_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_id text,
  uid text NOT NULL UNIQUE DEFAULT lpad((1000 + floor(random() * 9000))::text, 4, '0'),
  referred_by_uid text,
  static_avatar text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.deposits
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS amount numeric NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS affiliate_id text,
  ADD COLUMN IF NOT EXISTS uid text,
  ADD COLUMN IF NOT EXISTS referred_by_uid text,
  ADD COLUMN IF NOT EXISTS static_avatar text;

UPDATE public.deposits
SET status = 'pending'
WHERE status IS NULL OR status NOT IN ('pending', 'success', 'cancelled', 'expired');

UPDATE public.deposits
SET expires_at = now() + interval '10 minutes'
WHERE expires_at IS NULL;

UPDATE public.profiles
SET uid = lpad((1000 + floor(random() * 9000))::text, 4, '0')
WHERE uid IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'deposits_status_check'
      AND conrelid = 'public.deposits'::regclass
  ) THEN
    ALTER TABLE public.deposits
      ADD CONSTRAINT deposits_status_check
      CHECK (status IN ('pending', 'success', 'cancelled', 'expired'));
  END IF;
END $$;

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_affiliates" ON public.affiliates;
CREATE POLICY "authenticated_select_affiliates" ON public.affiliates FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_affiliates" ON public.affiliates;
CREATE POLICY "authenticated_insert_affiliates" ON public.affiliates FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_affiliates" ON public.affiliates;
CREATE POLICY "authenticated_update_affiliates" ON public.affiliates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_delete_affiliates" ON public.affiliates;
CREATE POLICY "authenticated_delete_affiliates" ON public.affiliates FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_pre_registrations" ON public.pre_registrations;
CREATE POLICY "authenticated_select_pre_registrations" ON public.pre_registrations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_pre_registrations" ON public.pre_registrations;
CREATE POLICY "authenticated_insert_pre_registrations" ON public.pre_registrations FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_pre_registrations" ON public.pre_registrations;
CREATE POLICY "authenticated_update_pre_registrations" ON public.pre_registrations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_delete_pre_registrations" ON public.pre_registrations;
CREATE POLICY "authenticated_delete_pre_registrations" ON public.pre_registrations FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "users_select_own_profiles" ON public.profiles;
CREATE POLICY "users_select_own_profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_insert_own_profiles" ON public.profiles;
CREATE POLICY "users_insert_own_profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_own_profiles" ON public.profiles;
CREATE POLICY "users_update_own_profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_delete_own_profiles" ON public.profiles;
CREATE POLICY "users_delete_own_profiles" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_select_own_deposits" ON public.deposits;
CREATE POLICY "users_select_own_deposits" ON public.deposits FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_insert_own_deposits" ON public.deposits;
CREATE POLICY "users_insert_own_deposits" ON public.deposits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_update_own_deposits" ON public.deposits;
CREATE POLICY "users_update_own_deposits" ON public.deposits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users_delete_own_deposits" ON public.deposits;
CREATE POLICY "users_delete_own_deposits" ON public.deposits FOR DELETE TO authenticated USING (auth.uid() = user_id);