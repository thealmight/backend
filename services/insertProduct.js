// services/insertProduct.js

const supabase = require('../db');

/**
 * Insert a new product row in Supabase.
 * @param {Object} params
 * @param {string} params.name - Name of the product.
 * @returns {Promise<Object>} - The inserted product record.
 */
async function insertProduct({ name }) {
  if (!name || typeof name !== 'string') {
    throw new Error('Product name must be a non-empty string');
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('❌ Product insert error:', error.message);
    throw error;
  }

  return data;
}

module.exports = insertProduct;
