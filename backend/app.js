require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const spoonacularRoutes = require('./routes/spoonacular');
const savedRecipesRoutes = require('./routes/savedRecipes');
const recipesRoutes = require('./routes/recipes');

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('SPOONACULAR_API_KEY:', process.env.SPOONACULAR_API_KEY ? 'Present' : 'Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers.authorization ? 'Present' : 'Missing'
    }
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/spoonacular', spoonacularRoutes);
app.use('/api/saved-recipes', savedRecipesRoutes);
app.use('/api/recipes', recipesRoutes);

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
