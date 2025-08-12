// sockets/tradeSocket.js
const supabase = require('../db');
const gameDataStore = require('../stores/gameDataStore');

module.exports = function tradeSocket(socket, io) {
  // Propose a trade
  socket.on('proposeTrade', async ({ toUserId, offer }) => {
    // Validate the trade proposal
    const tradeId = `${socket.userId}-${toUserId}-${Date.now()}`;
    
    // Store trade proposal in memory
    const tradeProposal = {
      tradeId,
      fromUserId: socket.userId,
      toUserId,
      offer,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    // Broadcast immediately
    io.to(toUserId).emit('tradeProposalReceived', {
      tradeId,
      from: socket.userId,
      offer,
      timestamp: new Date().toISOString()
    });
    
    // Persist to DB in background
    supabase.from('trades').insert([{
      trade_id: tradeId,
      from_user_id: socket.userId,
      to_user_id: toUserId,
      offer: offer,
      status: 'pending',
      created_at: new Date().toISOString()
    }]).catch(error => {
      console.error('❌ Trade DB insert error:', error.message);
    });
  });

  // Accept a trade
  socket.on('acceptTrade', async ({ tradeId }) => {
    // Update trade status in DB
    const { error } = await supabase
      .from('trades')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('trade_id', tradeId);
    
    if (error) {
      console.error('❌ Trade accept error:', error.message);
      return socket.emit('error', { message: 'Failed to accept trade' });
    }
    
    // Broadcast immediately
    io.to(tradeId).emit('tradeAccepted', { 
      tradeId, 
      acceptedBy: socket.userId,
      acceptedAt: new Date().toISOString()
    });
  });

  // Reject a trade
  socket.on('rejectTrade', async ({ tradeId }) => {
    // Update trade status in DB
    const { error } = await supabase
      .from('trades')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('trade_id', tradeId);
    
    if (error) {
      console.error('❌ Trade reject error:', error.message);
      return socket.emit('error', { message: 'Failed to reject trade' });
    }
    
    // Broadcast immediately
    io.to(tradeId).emit('tradeRejected', { 
      tradeId, 
      rejectedBy: socket.userId,
      rejectedAt: new Date().toISOString()
    });
  });
};
