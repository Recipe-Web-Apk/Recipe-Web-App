const express = require('express');
const router = express.Router();
const {searchRecipe} = require('../controllers/recipeController');

router.post('/search', searchRecipe);

module.exports = router;
