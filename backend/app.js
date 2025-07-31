require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const spoonacularRoutes = require('./routes/spoonacular');
const savedRecipesRoutes = require('./routes/savedRecipes');
const recipesRoutes = require('./routes/recipes');
const likesRoutes = require('./routes/likes');
const viewsRoutes = require('./routes/views');
const recommendationsRoutes = require('./routes/recommendations');
const similarRecipesRoutes = require('./routes/similarRecipes');
const autofillRoutes = require('./routes/autofill');
const trendingRoutes = require('./routes/trending');

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP'
});

const spoonacularLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many Spoonacular API requests'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts'
});

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/api', apiLimiter);
app.use('/api/spoonacular', spoonacularLimiter);
app.use('/api/auth', authLimiter);

app.use((req, res, next) => {
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/spoonacular', spoonacularRoutes);
app.use('/api/saved-recipes', savedRecipesRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api', similarRecipesRoutes);
app.use('/api', autofillRoutes);
app.use('/api/trending', trendingRoutes);

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
