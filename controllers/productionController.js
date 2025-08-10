// controllers/productionController.js

const supabase = require('../db');
const getSupabaseProfile = require('../services/getSupabaseProfile');
const { updatePlayerRound } = require('../services/updatePlayerRound');

// 🏭 Create a production record (Operator only)
exports.createRecord = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });
    if (profile.role !== 'operator')
      return res.status(403).json({ error: 'Only operators can create production records.' });

    const recordToInsert = {
      ...req.body,
      created_by: profile.id
    };

    const { data, error } = await supabase
      .from('production')
      .insert([recordToInsert])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error('Create production error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Get production records by round (Authenticated user)
exports.getByRound = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });

    const { round } = req.params;

    const { data, error } = await supabase
      .from('production')
      .select('*')
      .eq('round_number', round);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Get production by round error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update a production record (Operator only)
exports.updateRecord = async (req, res) => {
  try {
    const profile = await getSupabaseProfile(req);
    if (!profile) return res.status(401).json({ error: 'Unauthorized' });
    if (profile.role !== 'operator')
      return res.status(403).json({ error: 'Only operators can update production records.' });

    const { id } = req.params;

    const { data: record, error: findError } = await supabase
      .from('production')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !record)
      return res.status(404).json({ error: 'Record not found' });

    const { data, error } = await supabase
      .from('production')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error('Update production error:', err);
    res.status(500).json({ error: err.message });
  }
};
