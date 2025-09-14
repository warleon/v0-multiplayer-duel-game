-- Function to get battle moves for a player
CREATE OR REPLACE FUNCTION public.get_available_moves()
RETURNS TABLE(
  id TEXT,
  name TEXT,
  damage INTEGER,
  accuracy INTEGER,
  description TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    'strike'::TEXT as id,
    'Strike'::TEXT as name,
    25 as damage,
    90 as accuracy,
    'A reliable physical attack'::TEXT as description
  UNION ALL
  SELECT 
    'power_attack'::TEXT,
    'Power Attack'::TEXT,
    40,
    70,
    'High damage but less accurate'::TEXT
  UNION ALL
  SELECT 
    'quick_strike'::TEXT,
    'Quick Strike'::TEXT,
    15,
    95,
    'Fast and accurate but weak'::TEXT
  UNION ALL
  SELECT 
    'critical_hit'::TEXT,
    'Critical Hit'::TEXT,
    35,
    75,
    'Aims for weak points'::TEXT;
$$;

-- Function to validate battle move
CREATE OR REPLACE FUNCTION public.is_valid_battle_turn(
  battle_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  battle_record RECORD;
BEGIN
  SELECT * INTO battle_record 
  FROM public.battle_states 
  WHERE id = battle_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if it's the user's turn and battle is active
  RETURN battle_record.current_turn = user_id_param 
    AND battle_record.status = 'active';
END;
$$;

-- Function to calculate battle damage with randomness
CREATE OR REPLACE FUNCTION public.calculate_battle_damage(
  base_damage INTEGER,
  accuracy INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hit_roll INTEGER;
  damage_roll INTEGER;
BEGIN
  -- Roll for hit (1-100)
  hit_roll := floor(random() * 100) + 1;
  
  IF hit_roll <= accuracy THEN
    -- Hit! Add some damage variance (-5 to +5)
    damage_roll := base_damage + floor(random() * 11) - 5;
    RETURN GREATEST(damage_roll, 1); -- Minimum 1 damage
  ELSE
    -- Miss!
    RETURN 0;
  END IF;
END;
$$;
