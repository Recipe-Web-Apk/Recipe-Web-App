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

console.log('Environment check:');
console.log('SPOONACULAR_API_KEY:', process.env.SPOONACULAR_API_KEY ? 'Present' : 'Missing');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

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
app.use('/api/likes', likesRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api', similarRecipesRoutes);
app.use('/api', autofillRoutes);

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
