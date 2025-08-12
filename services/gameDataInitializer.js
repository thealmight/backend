// services/gameDataInitializer.js
const supabase = require('../db');

async function initializeGameData(gameId, countries, roundNumber) {
  try {
    // Generate production and demand data
    const { production, demand } = generateProductionDemandData(countries);
    
    // Insert production data
    const productionData = production.map(p => ({
      game_id: gameId,
      country: p.country,
      product: p.product,
      quantity: p.quantity
    }));
    
    const { error: productionError } = await supabase
      .from('production')
      .insert(productionData);
    
    if (productionError) {
      console.error('Production data insertion error:', productionError);
      return false;
    }
    
    // Insert demand data
    const demandData = demand.map(d => ({
      game_id: gameId,
      country: d.country,
      product: d.product,
      quantity: d.quantity
    }));
    
    const { error: demandError } = await supabase
      .from('demand')
      .insert(demandData);
    
    if (demandError) {
      console.error('Demand data insertion error:', demandError);
      return false;
    }
    
    console.log(`✅ Game data initialized for game ${gameId}, round ${roundNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Game data initialization error:', error);
    return false;
  }
}

function generateProductionDemandData(countries) {
  const products = ['Steel', 'Grain', 'Oil', 'Electronics', 'Textiles'];
  
  // Initialize production and demand arrays
  const production = [];
  const demand = [];
  
  // Track which products each country produces
  const countryProductions = {};
  countries.forEach(country => {
    countryProductions[country] = [];
  });
  
  // Assign 2-3 products to each country for production
  products.forEach(product => {
    // Shuffle countries to randomize assignment
    const shuffledCountries = [...countries].sort(() => Math.random() - 0.5);
    
    // Each product is produced by 2-3 countries (to ensure total production can reach 100)
    const numProducers = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const producingCountries = shuffledCountries.slice(0, numProducers);
    
    // Distribute 100 units of production among producing countries
    let remainingProduction = 100;
    producingCountries.forEach((country, index) => {
      // For the last country, assign all remaining production
      const quantity = (index === producingCountries.length - 1) 
        ? remainingProduction 
        : Math.floor(Math.random() * (remainingProduction - (producingCountries.length - index - 1))) + 1;
      
      production.push({
        country,
        product,
        quantity
      });
      
      countryProductions[country].push(product);
      remainingProduction -= quantity;
    });
  });
  
  // Assign demand for each product to countries that don't produce it
  products.forEach(product => {
    // Find countries that don't produce this product
    const nonProducingCountries = countries.filter(country => 
      !countryProductions[country].includes(product)
    );
    
    // Distribute 100 units of demand among non-producing countries
    let remainingDemand = 100;
    nonProducingCountries.forEach((country, index) => {
      // For the last country, assign all remaining demand
      const quantity = (index === nonProducingCountries.length - 1) 
        ? remainingDemand 
        : Math.floor(Math.random() * (remainingDemand - (nonProducingCountries.length - index - 1))) + 1;
      
      demand.push({
        country,
        product,
        quantity
      });
      
      remainingDemand -= quantity;
    });
  });
  
  return { production, demand };
}

module.exports = initializeGameData;
