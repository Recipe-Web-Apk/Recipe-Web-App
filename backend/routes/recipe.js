const express = require('express');
const router = express.Router();
const { createRecipe, getAllRecipes, getRecipeById, updateRecipe, deleteRecipe, searchRecipes } = require('../controllers/recipeControllers');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/search', searchRecipes);

router.post('/', authenticateToken, createRecipe);
router.put('/:id', authenticateToken, updateRecipe);
router.delete('/:id', authenticateToken, deleteRecipe);

module.exports = router;
