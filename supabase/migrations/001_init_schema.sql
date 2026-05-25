-- Create tables for poker app
-- Run this in Supabase SQL Editor to initialize the database

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Player profiles table
CREATE TABLE IF NOT EXISTS public.player_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  chip_stack NUMERIC DEFAULT 0,
  total_buy_ins NUMERIC DEFAULT 0,
  total_winnings NUMERIC DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  last_played TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT CHECK (game_type IN ('cash', 'tournament', 'sng')) NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
  buy_in NUMERIC NOT NULL,
  small_blind NUMERIC NOT NULL,
  big_blind NUMERIC NOT NULL,
  max_players INTEGER DEFAULT 6,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.users(id),
  total_pot NUMERIC DEFAULT 0
);

-- Game players table
CREATE TABLE IF NOT EXISTS public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.player_profiles(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  buy_in_amount NUMERIC NOT NULL,
  current_chips NUMERIC NOT NULL,
  position TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  folded BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  final_position INTEGER,
  winnings NUMERIC DEFAULT 0
);

-- Hands table
CREATE TABLE IF NOT EXISTS public.hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  hand_number INTEGER NOT NULL,
  button_position INTEGER NOT NULL,
  small_blind_position INTEGER NOT NULL,
  big_blind_position INTEGER NOT NULL,
  community_cards TEXT[] DEFAULT '{}',
  pot_size NUMERIC DEFAULT 0,
  winner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Player hands table (individual player hands in a game)
CREATE TABLE IF NOT EXISTS public.player_hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_id UUID NOT NULL REFERENCES public.hands(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.player_profiles(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  hole_cards TEXT[] DEFAULT '{}',
  position TEXT NOT NULL,
  actions TEXT,
  final_hand_rank TEXT,
  won_hand BOOLEAN DEFAULT FALSE,
  hand_winnings NUMERIC DEFAULT 0
);

-- Player stats table (aggregated statistics)
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_buy_ins NUMERIC DEFAULT 0,
  total_winnings NUMERIC DEFAULT 0,
  profit_loss NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  vpip NUMERIC DEFAULT 0,
  pfr NUMERIC DEFAULT 0,
  aggression_factor NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transactions table (buy-ins, cash-outs, winnings)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('buy_in', 'cash_out', 'winnings', 'refund')) NOT NULL,
  amount NUMERIC NOT NULL,
  game_id UUID REFERENCES public.games(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_game_players_user_id ON public.game_players(user_id);
CREATE INDEX idx_game_players_game_id ON public.game_players(game_id);
CREATE INDEX idx_hands_game_id ON public.hands(game_id);
CREATE INDEX idx_player_hands_user_id ON public.player_hands(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_games_created_by ON public.games(created_by);
CREATE INDEX idx_player_profiles_user_id ON public.player_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can view all public profiles" ON public.users
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- RLS Policies for player_profiles
CREATE POLICY "Users can view all player profiles" ON public.player_profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.player_profiles
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policies for games
CREATE POLICY "Everyone can view games" ON public.games
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = created_by));

CREATE POLICY "Game creators can update their games" ON public.games
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = created_by));

-- RLS Policies for game_players
CREATE POLICY "Everyone can view game players" ON public.game_players
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can join games" ON public.game_players
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own game player record" ON public.game_players
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policies for hands
CREATE POLICY "Everyone can view hands" ON public.hands
  FOR SELECT USING (TRUE);

-- RLS Policies for player_hands
CREATE POLICY "Everyone can view player hands" ON public.player_hands
  FOR SELECT USING (TRUE);

-- RLS Policies for player_stats
CREATE POLICY "Everyone can view player stats" ON public.player_stats
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own stats" ON public.player_stats
  FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = user_id));
