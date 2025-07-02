const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, instructions, image } = req.body;
        
        if (!title || !description || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Title, description, ingredients, and instructions are required' });
        }
        
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
        }
        
        const newRecipe = await prisma.recipe.create({
            data: {
                title,
                description,
                ingredients: JSON.stringify(ingredients),
                instructions,
                image: image || null,
                userId: req.user.id
            }
        });
        
        res.status(201).json({ 
            message: 'Recipe created successfully',
            recipe: {
                ...newRecipe,
                ingredients: JSON.parse(newRecipe.ingredients)
            }
        });
    } catch (error) {
        console.error('Create recipe error:', error);
        res.status(500).json({ error: 'Failed to create recipe' });
    }
};

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });
        
        const recipesWithParsedIngredients = recipes.map(recipe => ({
            ...recipe,
            ingredients: JSON.parse(recipe.ingredients)
        }));
        
        res.json({ 
            message: 'All recipes retrieved successfully',
            recipes: recipesWithParsedIngredients
        });
    } catch (error) {
        console.error('Get all recipes error:', error);
        res.status(500).json({ error: 'Failed to retrieve recipes' });
    }
};

const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });
        
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        res.json({ 
            message: 'Recipe retrieved successfully',
            recipe: {
                ...recipe,
                ingredients: JSON.parse(recipe.ingredients)
            }
        });
    } catch (error) {
        console.error('Get recipe by ID error:', error);
        res.status(500).json({ error: 'Failed to retrieve recipe' });
    }
};

const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, ingredients, instructions, image } = req.body;
        
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!existingRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        if (existingRecipe.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only update your own recipes' });
        }
        
        if (!title || !description || !ingredients || !instructions) {
            return res.status(400).json({ error: 'Title, description, ingredients, and instructions are required' });
        }
        
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
        }
        
        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                ingredients: JSON.stringify(ingredients),
                instructions,
                image: image || null
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });
        
        res.json({ 
            message: 'Recipe updated successfully',
            recipe: {
                ...updatedRecipe,
                ingredients: JSON.parse(updatedRecipe.ingredients)
            }
        });
    } catch (error) {
        console.error('Update recipe error:', error);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!existingRecipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        
        if (existingRecipe.userId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own recipes' });
        }
        
        const deletedRecipe = await prisma.recipe.delete({
            where: { id: parseInt(id) }
        });
        
        res.json({ 
            message: 'Recipe deleted successfully',
            recipe: {
                ...deletedRecipe,
                ingredients: JSON.parse(deletedRecipe.ingredients)
            }
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};

const searchRecipes = async (req, res) => {
    try {
        const { ingredients, calories } = req.body;

        if (!Array.isArray(ingredients) || ingredients.length < 3) {
            return res.status(400).json({ message: "Please provide at least 3 ingredients" });
        }

        const allRecipes = await prisma.recipe.findMany({
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });

        const results = allRecipes.filter(recipe => {
            const recipeIngredients = JSON.parse(recipe.ingredients);
            const matched = ingredients.filter(i => recipeIngredients.includes(i));
            const meetsCalories = calories ? recipe.calories <= calories : true;
            return matched.length >= 2 && meetsCalories;
        }).map(recipe => ({
            ...recipe,
            ingredients: JSON.parse(recipe.ingredients)
        }));

        res.json(results);
    } catch (error) {
        console.error('Search recipes error:', error);
        res.status(500).json({ error: 'Failed to search recipes' });
    }
};

module.exports = { createRecipe, getAllRecipes, getRecipeById, updateRecipe, deleteRecipe, searchRecipes };
