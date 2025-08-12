// stores/gameDataStore.js
class GameDataStore {
  constructor() {
    this.games = new Map(); // gameId -> game data
    this.users = new Map(); // userId -> user data
  }
  
  // Game data methods
  initializeGameData(gameId, data) {
    this.games.set(gameId, {
      production: data.production || [],
      demand: data.demand || [],
      tariffRates: data.tariffRates || [],
      rounds: data.rounds || [],
      currentRound: 1,
      status: 'waiting'
    });
  }
  
  getGameData(gameId) {
    return this.games.get(gameId);
  }
  
  updateGameData(gameId, updates) {
    const game = this.games.get(gameId);
    if (game) {
      Object.assign(game, updates);
      return true;
    }
    return false;
  }
  
  updateGameRound(gameId, roundNumber) {
    const game = this.games.get(gameId);
    if (game) {
      game.currentRound = roundNumber;
      return true;
    }
    return false;
  }
  
  updateGameStatus(gameId, status) {
    const game = this.games.get(gameId);
    if (game) {
      game.status = status;
      return true;
    }
    return false;
  }
  
  // User status methods
  addUser(userId, userData) {
    this.users.set(userId, {
      ...userData,
      isOnline: true,
      lastSeen: new Date().toISOString()
    });
  }
  
  removeUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date().toISOString();
      return true;
    }
    return false;
  }
  
  updateUserStatus(userId, status) {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, status);
      return true;
    }
    return false;
  }
  
  getUserStatus(userId) {
    return this.users.get(userId);
  }
  
  getOnlineUsers() {
    return Array.from(this.users.values())
      .filter(user => user.isOnline)
      .map(user => ({
        userId: user.userId,
        username: user.username,
        country: user.country,
        isOnline: user.isOnline
      }));
  }
  
  // Game data specific methods
  updateProductionData(gameId, productionData) {
    const game = this.games.get(gameId);
    if (game) {
      game.production = productionData;
      return true;
    }
    return false;
  }
  
  updateDemandData(gameId, demandData) {
    const game = this.games.get(gameId);
    if (game) {
      game.demand = demandData;
      return true;
    }
    return false;
  }
  
  updateTariffRates(gameId, tariffData) {
    const game = this.games.get(gameId);
    if (game) {
      game.tariffRates = tariffData;
      return true;
    }
    return false;
  }
}

module.exports = new GameDataStore();