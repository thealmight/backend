module.exports = function requirePlayer(req, res, next) {
  if (req.user?.role !== 'player') {
    return res.status(403).json({ error: 'Only players can access this route.' });
  }
  next();
};
