import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BattleArena } from "@/components/battle-arena";

interface BattlePageProps {
  params: { duelId: string };
}

export default async function BattlePage(context: BattlePageProps) {
  console.log("params:", context.params);
  const { duelId } = context.params;
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Get duel information
  const { data: duel } = await supabase
    .from("duels")
    .select(
      `
      *,
      creator:creator_id(id, username, display_name, wins, losses),
      opponent:opponent_id(id, username, display_name, wins, losses)
    `
    )
    .eq("id", duelId)
    .single();

  console.log("duel:", duel);

  if (!duel) {
    redirect("/duels");
  }

  // Check if user is participant
  if (duel.creator_id !== user.id && duel.opponent_id !== user.id) {
    redirect("/duels");
  }

  // Check if duel is ready for battle
  if (
    duel.status !== "accepted"
    // && duel.status !== "in_progress"
  ) {
    redirect("/duels");
  }

  // Get or create battle state
  let { data: battleState } = await supabase
    .from("battle_states")
    .select("*")
    .eq("duel_id", duelId)
    .single();

  // If no battle state exists and duel is accepted, create one
  if (!battleState && duel.status === "accepted") {
    const { data: newBattleState, error: battleError } = await supabase
      .from("battle_states")
      .insert({
        duel_id: duelId,
        player1_id: duel.creator_id,
        player2_id: duel.opponent_id,
        current_turn: duel.creator_id, // Creator goes first
        player1_hp: 100,
        player2_hp: 100,
        battle_log: [],
      })
      .select()
      .single();

    console.log("battle error:", battleError);
    if (battleError) {
      redirect("/duels");
    }

    battleState = newBattleState;

    // Update duel status to in_progress
    await supabase
      .from("duels")
      .update({ status: "in_progress" })
      .eq("id", duelId);
  }

  if (!battleState) {
    redirect("/duels");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <BattleArena
        duel={duel}
        battleState={battleState}
        currentUserId={user.id}
      />
    </div>
  );
}
