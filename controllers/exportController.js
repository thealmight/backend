// controllers/exportController.js
const { Parser } = require('json2csv');
const supabase = require('../db');

exports.exportGameData = async (req, res) => {
  try {
    const { gameId } = req.params;

    const { data: production } = await supabase.from('production').select('*').eq('game_id', gameId);
    const { data: demand } = await supabase.from('demand').select('*').eq('game_id', gameId);

    const parser = new Parser();
    const prodCSV = parser.parse(production);
    const demCSV = parser.parse(demand);

    res.setHeader('Content-Disposition', `attachment; filename=game_${gameId}_data.csv`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(`${prodCSV}\n\n${demCSV}`);
  } catch (error) {
    console.error('❌ CSV export error:', error);
    res.status(500).json({ error: 'Failed to export game data' });
  }
};
