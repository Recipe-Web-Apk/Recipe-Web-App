const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const  authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('api/auth', authRoutes);
app.use('api/recipe', recipeRoutes);


app.get('/', (req, res) => {
    res.send('App is working');
});

module.exports = app;
