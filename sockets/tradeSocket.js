// sockets/tradeSocket.js
module.exports = (io) => {
  io.on('connection', (socket) => {
    // Propose a trade
    socket.on('proposeTrade', ({ toUserId, offer }) => {
      io.to(toUserId).emit('tradeProposalReceived', {
        from: socket.userId,
        offer,
        timestamp: new Date().toISOString()
      });
    });

    // Accept a trade
    socket.on('acceptTrade', ({ tradeId }) => {
      // TODO: Validate and persist trade
      io.to(tradeId).emit('tradeAccepted', { tradeId, acceptedBy: socket.userId });
    });

    // Reject a trade
    socket.on('rejectTrade', ({ tradeId }) => {
      io.to(tradeId).emit('tradeRejected', { tradeId, rejectedBy: socket.userId });
    });
  });
};
