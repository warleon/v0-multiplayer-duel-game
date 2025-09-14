-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  coins INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Allow users to view other profiles for leaderboard/duel board
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);

-- Create duels table
CREATE TABLE IF NOT EXISTS public.duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  bet_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'in_progress', 'completed', 'cancelled')),
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on duels
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

-- Duels policies
CREATE POLICY "duels_select_all" ON public.duels FOR SELECT USING (true);
CREATE POLICY "duels_insert_own" ON public.duels FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "duels_update_participants" ON public.duels FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = opponent_id);
CREATE POLICY "duels_delete_own" ON public.duels FOR DELETE USING (auth.uid() = creator_id);

-- Create battle_states table for turn-based combat
CREATE TABLE IF NOT EXISTS public.battle_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID NOT NULL REFERENCES public.duels(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES public.profiles(id),
  player2_id UUID NOT NULL REFERENCES public.profiles(id),
  current_turn UUID NOT NULL REFERENCES public.profiles(id),
  player1_hp INTEGER DEFAULT 100,
  player2_hp INTEGER DEFAULT 100,
  player1_moves TEXT[] DEFAULT '{}',
  player2_moves TEXT[] DEFAULT '{}',
  battle_log JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on battle_states
ALTER TABLE public.battle_states ENABLE ROW LEVEL SECURITY;

-- Battle states policies
CREATE POLICY "battle_states_select_participants" ON public.battle_states FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "battle_states_update_participants" ON public.battle_states FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Create notifications table for real-time updates
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('duel_request', 'duel_accepted', 'battle_turn', 'battle_finished')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
