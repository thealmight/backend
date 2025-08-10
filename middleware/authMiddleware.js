const authenticateToken = require('./authenticateSupabaseToken');
const requireOperator = require('./requireOperator');
const requirePlayer = require('./requirePlayer'); // ← create this if needed

module.exports = {
  authenticateToken,
  requireOperator,
  requirePlayer
};
