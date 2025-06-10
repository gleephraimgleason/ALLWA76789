-- =============================================================================
-- DATABASE SETUP SCRIPT FOR FINANCIAL APPLICATION
-- =============================================================================
-- This script creates all necessary tables, indexes, triggers, and policies
-- for a complete financial management system with Supabase authentication
-- =============================================================================

-- =============================================================================
-- TABLES CREATION
-- =============================================================================

-- Users table - extends auth.users with profile information
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    account_number TEXT UNIQUE NOT NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    location TEXT,
    language TEXT DEFAULT 'ar',
    currency TEXT DEFAULT 'dzd',
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    referral_code TEXT UNIQUE,
    used_referral_code TEXT,
    referral_earnings DECIMAL(15,2) DEFAULT 0.00 NOT NULL
);

-- Balances table - stores multi-currency balances for each user
CREATE TABLE IF NOT EXISTS public.balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dzd DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    eur DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    usd DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    gbp DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions table - records all financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recharge', 'transfer', 'bill', 'investment', 'conversion', 'withdrawal')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'dzd' CHECK (currency IN ('dzd', 'eur', 'usd', 'gbp')),
    description TEXT NOT NULL,
    reference TEXT,
    recipient TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Investments table - tracks investment products
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    profit_rate DECIMAL(5,2) NOT NULL CHECK (profit_rate >= 0 AND profit_rate <= 100),
    profit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_investment_dates CHECK (end_date > start_date)
);

-- Savings goals table - user-defined savings targets
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (current_amount >= 0),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_savings_amounts CHECK (current_amount <= target_amount)
);

-- Cards table - physical and virtual payment cards
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    card_number TEXT NOT NULL,
    card_type TEXT NOT NULL CHECK (card_type IN ('solid', 'virtual')),
    is_frozen BOOLEAN DEFAULT false NOT NULL,
    spending_limit DECIMAL(15,2) DEFAULT 0.00 NOT NULL CHECK (spending_limit >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications table - system and user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('success', 'error', 'info', 'warning')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Referrals table - user referral system
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL UNIQUE,
    reward_amount DECIMAL(15,2) DEFAULT 500.00 NOT NULL CHECK (reward_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_number ON public.users(account_number);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Balance indexes
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON public.balances(user_id);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, created_at DESC);

-- Investment indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON public.investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_end_date ON public.investments(end_date);

-- Savings goal indexes
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_status ON public.savings_goals(status);
CREATE INDEX IF NOT EXISTS idx_savings_goals_deadline ON public.savings_goals(deadline);

-- Card indexes
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_card_number ON public.cards(card_number);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Referral indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_balances_updated_at 
    BEFORE UPDATE ON public.balances
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at 
    BEFORE UPDATE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at 
    BEFORE UPDATE ON public.savings_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character code with letters and numbers
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
DECLARE
    new_referral_code TEXT;
    referrer_user_id UUID;
BEGIN
    -- Generate unique referral code
    new_referral_code := public.generate_referral_code();
    
    -- Insert user profile
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        phone, 
        account_number, 
        join_date,
        referral_code,
        used_referral_code
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'ACC' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0'),
        timezone('utc'::text, now()),
        new_referral_code,
        COALESCE(NEW.raw_user_meta_data->>'used_referral_code', '')
    );
    
    -- Create initial balance record with demo amounts
    INSERT INTO public.balances (user_id, dzd, eur, usd, gbp)
    VALUES (NEW.id, 15000.00, 75.00, 85.00, 65.50);
    
    -- Handle referral reward if user used a referral code
    IF NEW.raw_user_meta_data->>'used_referral_code' IS NOT NULL AND NEW.raw_user_meta_data->>'used_referral_code' != '' THEN
        -- Find the referrer
        SELECT id INTO referrer_user_id 
        FROM public.users 
        WHERE referral_code = NEW.raw_user_meta_data->>'used_referral_code';
        
        -- If referrer found, create referral record and add reward
        IF referrer_user_id IS NOT NULL THEN
            -- Create referral record
            INSERT INTO public.referrals (
                referrer_id,
                referred_id,
                referral_code,
                reward_amount,
                status
            )
            VALUES (
                referrer_user_id,
                NEW.id,
                NEW.raw_user_meta_data->>'used_referral_code',
                500.00,
                'completed'
            );
            
            -- Add reward to referrer's balance
            UPDATE public.balances 
            SET dzd = dzd + 500.00,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = referrer_user_id;
            
            -- Update referrer's earnings
            UPDATE public.users 
            SET referral_earnings = referral_earnings + 500.00,
                updated_at = timezone('utc'::text, now())
            WHERE id = referrer_user_id;
            
            -- Create notification for referrer
            INSERT INTO public.notifications (
                user_id,
                type,
                title,
                message
            )
            VALUES (
                referrer_user_id,
                'success',
                'مكافأة إحالة جديدة',
                'تم إضافة 500 دج إلى رصيدك بسبب إحالة مستخدم جديد'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Balances table policies
DROP POLICY IF EXISTS "Users can view own balance" ON public.balances;
CREATE POLICY "Users can view own balance" ON public.balances
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own balance" ON public.balances;
CREATE POLICY "Users can update own balance" ON public.balances
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own balance" ON public.balances;
CREATE POLICY "Users can insert own balance" ON public.balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Investments table policies
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
CREATE POLICY "Users can view own investments" ON public.investments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
CREATE POLICY "Users can insert own investments" ON public.investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own investments" ON public.investments;
CREATE POLICY "Users can update own investments" ON public.investments
    FOR UPDATE USING (auth.uid() = user_id);

-- Savings goals table policies
DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goals;
CREATE POLICY "Users can view own savings goals" ON public.savings_goals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings goals" ON public.savings_goals;
CREATE POLICY "Users can insert own savings goals" ON public.savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings goals" ON public.savings_goals;
CREATE POLICY "Users can update own savings goals" ON public.savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Cards table policies
DROP POLICY IF EXISTS "Users can view own cards" ON public.cards;
CREATE POLICY "Users can view own cards" ON public.cards
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cards" ON public.cards;
CREATE POLICY "Users can insert own cards" ON public.cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;
CREATE POLICY "Users can update own cards" ON public.cards
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications table policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Referrals table policies
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals" ON public.referrals
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can update own referrals" ON public.referrals;
CREATE POLICY "Users can update own referrals" ON public.referrals
    FOR UPDATE USING (auth.uid() = referrer_id);

-- =============================================================================
-- ENABLE REALTIME FOR TABLES
-- =============================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;

-- =============================================================================
-- SCRIPT COMPLETION
-- =============================================================================
-- Database setup completed successfully!
-- All tables, indexes, triggers, and policies have been created.
-- =============================================================================
