// services/gameDataGenerators.js

const generateCountries = () => {
  return ['USA', 'China', 'Germany', 'Japan', 'India'].map((name, index) => ({
    id: index + 1,
    name,
    gdp: Math.floor(Math.random() * 10000 + 5000),
    population: Math.floor(Math.random() * 100 + 50),
  }));
};

const generateProducts = () => {
  return ['Steel', 'Grain', 'Oil', 'Electronics', 'Textiles'].map((type, index) => ({
    id: index + 1,
    type,
    basePrice: Math.floor(Math.random() * 100 + 50),
  }));
};

const generateProduction = (countries, products) => {
  return countries.map(country => ({
    countryId: country.id,
    countryName: country.name,
    production: products.map(product => ({
      productId: product.id,
      productType: product.type,
      quantity: Math.floor(Math.random() * 1000),
    })),
  }));
};

const generateDemand = (countries, products) => {
  return countries.map(country => ({
    countryId: country.id,
    countryName: country.name,
    demand: products.map(product => ({
      productId: product.id,
      productType: product.type,
      quantity: Math.floor(Math.random() * 1000),
    })),
  }));
};

module.exports = {
  generateCountries,
  generateProducts,
  generateProduction,
  generateDemand,
};
