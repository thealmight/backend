const express = require('express');
const router = express.Router();
const { loginUser, getAllUsers } = require('../controllers/userController');

//
// 👤 User Routes
//

// POST login (uses Supabase token from frontend)
router.post('/login', loginUser);

// GET all users (restricted to operator)
router.get('/', getAllUsers);

module.exports = router;
