const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const spoonacularRoutes = require('./routes/spoonacular');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// app.use('/api/auth', authRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/spoonacular', spoonacularRoutes);

app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
