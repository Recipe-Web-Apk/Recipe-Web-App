const express = require('express');
const router = express.Router();
const {searchRecipes} = require('../controllers/recipeControllers');

router.post('/search', searchRecipes);

module.exports = router;
