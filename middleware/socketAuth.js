// middleware/socketAuth.js
module.exports = (allowedRoles) => {
  return (socket, next) => {
    const role = socket.role;
    if (!allowedRoles.includes(role)) {
      return next(new Error('Unauthorized'));
    }
    next();
  };
};
