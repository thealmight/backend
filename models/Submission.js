// /app/models/Submission.js
module.exports = {
  create: async (data) => {
    // mock insert logic
    return { success: true, data };
  },
  findByGameId: async (gameId) => {
    // mock fetch logic
    return [{ gameId, content: 'Sample submission' }];
  }
};
