// middleware/requireOperator.js

function requireOperator(req, res, next) {
  if (req.user?.role !== 'operator') {
    return res.status(403).json({ error: 'Operator access required' });
  }
  next();
}

module.exports = requireOperator;
