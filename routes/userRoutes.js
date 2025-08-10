// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, getAllUsers } = require('../controllers/userController');

//
// 👤 User Routes
//

// POST login
router.post('/login', loginUser);

// GET all users (optional: restrict to operator/admin)
router.get('/', getAllUsers);

module.exports = router;
