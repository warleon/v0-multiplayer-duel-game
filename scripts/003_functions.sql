-- Function to update coins after duel completion
CREATE OR REPLACE FUNCTION public.complete_duel(
  duel_id_param UUID,
  winner_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duel_record RECORD;
  winner_coins INTEGER;
  loser_coins INTEGER;
  payout INTEGER;
BEGIN
  -- Get duel information
  SELECT * INTO duel_record FROM public.duels WHERE id = duel_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Duel not found';
  END IF;
  
  -- Calculate payout (winner gets 80% of loser's bet)
  payout := FLOOR(duel_record.bet_amount * 0.8);
  
  -- Update winner coins and stats
  UPDATE public.profiles 
  SET coins = coins + payout, wins = wins + 1, updated_at = NOW()
  WHERE id = winner_id_param;
  
  -- Update loser coins and stats
  UPDATE public.profiles 
  SET coins = coins - duel_record.bet_amount, losses = losses + 1, updated_at = NOW()
  WHERE id = (CASE WHEN duel_record.creator_id = winner_id_param THEN duel_record.opponent_id ELSE duel_record.creator_id END);
  
  -- Update duel status
  UPDATE public.duels 
  SET status = 'completed', winner_id = winner_id_param, updated_at = NOW()
  WHERE id = duel_id_param;
END;
$$;

-- Function to check if user can afford a duel
CREATE OR REPLACE FUNCTION public.can_afford_duel(
  user_id_param UUID,
  bet_amount_param INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_coins INTEGER;
BEGIN
  SELECT coins INTO user_coins FROM public.profiles WHERE id = user_id_param;
  RETURN user_coins >= bet_amount_param;
END;
$$;
