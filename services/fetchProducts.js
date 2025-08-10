// services/fetchProducts.js

const supabase = require('../db');

/**
 * Fetch all products, ordered alphabetically by name.
 * @returns {Promise<Array>} - Array of product records.
 */
async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Product fetch error:', error.message);
    throw error;
  }

  return data || [];
}

module.exports = fetchProducts;
