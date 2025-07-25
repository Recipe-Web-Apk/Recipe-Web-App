require('dotenv').config();

const express = require('express');
const cors = require('cors');
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



const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
