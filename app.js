require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// ----- Import routes -----
console.log('🔍 Loading authRoutes...');
const { router: authRoutes } = require('./routes/authRouter');

console.log('✅ authRoutes loaded');

console.log('🔍 Loading gameRoutes...');
const gameRoutes = require('./routes/gameRoutes');
console.log('✅ gameRoutes loaded');

console.log('🔍 Loading userRoutes...');
const userRoutes = require('./routes/userRoutes');
console.log('✅ userRoutes loaded');

console.log('🔍 Loading tariffRoutes...');
const tariffRoutes = require('./routes/tariffRoutes');
console.log('✅ tariffRoutes loaded');

console.log('🔍 Loading playerRoutes...');
const playerRoutes = require('./routes/playerRoutes');
console.log('✅ playerRoutes loaded');

console.log('🔍 Loading productionRoutes...');
const productionRoutes = require('./routes/productionRoutes');
console.log('✅ productionRoutes loaded');

console.log('🔍 Loading submissionRoutes...');
const submissionRoutes = require('./routes/submissionRoutes');
console.log('✅ submissionRoutes loaded');

console.log('🔍 Loading supplyRoutes...');
const supplyRoutes = require('./routes/supplyRoutes');
console.log('✅ supplyRoutes loaded');

console.log('🔍 Loading testRoundRoutes...');
const testRoundRoutes = require('./routes/testRoundRoutes');
console.log('✅ testRoundRoutes loaded');


// const testRoutes = require('./routes/test'); // Uncomment if needed

const app = express();

// ----- Middleware -----
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
if (!authRoutes) console.error('❌ authRoutes is undefined');
app.use('/api/auth', authRoutes);

if (!gameRoutes) console.error('❌ gameRoutes is undefined');
app.use('/api/game', gameRoutes);

if (!userRoutes) console.error('❌ userRoutes is undefined');
app.use('/api/users', userRoutes);

if (!tariffRoutes) console.error('❌ tariffRoutes is undefined');
app.use('/api/tariff', tariffRoutes);

if (!playerRoutes) console.error('❌ playerRoutes is undefined');
app.use('/api/players', playerRoutes);

if (!productionRoutes) console.error('❌ productionRoutes is undefined');
app.use('/api/production', productionRoutes);

if (!submissionRoutes) console.error('❌ submissionRoutes is undefined');
app.use('/api/submissions', submissionRoutes);

if (!supplyRoutes) console.error('❌ supplyRoutes is undefined');
app.use('/api/supply', supplyRoutes);


if (!testRoundRoutes) console.error('❌ testRoundRoutes is undefined');
app.use('/api/test-round', testRoundRoutes);

// ----- General Routes -----
app.get('/', (req, res) => {
  res.send({ message: 'Econ Empire backend is live!' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Econ Empire API is running' });
});

// ----- Error Handling -----
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
