// services/authService.js
const bcrypt = require('bcrypt');
const supabase = require('../db');

// Hash a password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify a password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Find user by username
const findUserByUsername = async (username) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }
  
  return data;
};

// Create a new user
const createUser = async (username, password) => {
  const hashedPassword = await hashPassword(password);
  
  // For demo purposes, we'll still generate an email but it won't be used for auth
  const email = `${username}@example.com`;
  const role = username === 'pavan' ? 'operator' : 'player';
  
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        username,
        email,
        role,
        password: hashedPassword // Add password field
      }
    ])
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
};

// Authenticate user with username and password
const authenticateUser = async (username, password) => {
  // Find user by username
  const user = await findUserByUsername(username);
  
  if (!user) {
    // User doesn't exist, create them
    return await createUser(username, password);
  }
  
  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }
  
  return user;
};

module.exports = {
  hashPassword,
  verifyPassword,
  findUserByUsername,
  createUser,
  authenticateUser
};