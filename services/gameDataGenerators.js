// services/gameDataGenerators.js

const generateCountries = () => {
  return ['USA', 'China', 'Germany', 'India', 'Brazil'].map((name, index) => ({
    id: index + 1,
    name,
    gdp: Math.floor(Math.random() * 10000 + 5000),
    population: Math.floor(Math.random() * 100 + 50),
  }));
};

const generateResources = () => {
  return ['Oil', 'Steel', 'Food', 'Electronics'].map((type, index) => ({
    id: index + 1,
    type,
    basePrice: Math.floor(Math.random() * 100 + 50),
  }));
};

const generateProduction = (countries, resources) => {
  return countries.map(country => ({
    countryId: country.id,
    production: resources.map(resource => ({
      resourceId: resource.id,
      quantity: Math.floor(Math.random() * 1000),
    })),
  }));
};

const generateDemand = (countries, resources) => {
  return countries.map(country => ({
    countryId: country.id,
    demand: resources.map(resource => ({
      resourceId: resource.id,
      quantity: Math.floor(Math.random() * 1000),
    })),
  }));
};

module.exports = {
  generateCountries,
  generateResources,
  generateProduction,
  generateDemand,
};
