require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const authRoutes = require('./routes/auth');
// const recipeRoutes = require('./routes/recipe');
const spoonacularRoutes = require('./routes/spoonacular');

// Debug: Check if environment variable is loaded
console.log('Environment check:');
console.log('SPOONACULAR_API_KEY:', process.env.SPOONACULAR_API_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
// app.use('/api/auth', authRoutes);
// app.use('/api/recipe', recipeRoutes);
app.use('/api/spoonacular', spoonacularRoutes);

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
