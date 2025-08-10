// services/assignCountriesToPlayers.js
const supabase = require('../db');

const COUNTRIES = ['USA', 'China', 'Germany', 'Japan', 'India'];

/**
 * Assigns countries to online players for a given game.
 * Updates each player's profile with their assigned country.
 * @param {string} gameId
 */
async function assignCountriesToPlayers(gameId) {
  const { data: players, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'player')
    .eq('is_online', true)
    .limit(COUNTRIES.length);

  if (error || !players || players.length < COUNTRIES.length) {
    console.error('❌ Not enough players to assign countries');
    return false;
  }

  const updates = players.map((player, index) => ({
    id: player.id,
    country: COUNTRIES[index]
  }));

  const { error: updateError } = await supabase
    .from('users')
    .upsert(updates, { onConflict: ['id'] });

  if (updateError) {
    console.error('❌ Country assignment failed:', updateError);
    return false;
  }

  console.log('✅ Countries assigned to players');
  return true;
}

module.exports = assignCountriesToPlayers;
