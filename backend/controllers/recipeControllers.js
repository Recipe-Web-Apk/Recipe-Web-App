const recipes = require('../data/data');

const searchRecipes = (req, res) => {
    const {ingredients, calories} = req.body;

    if (!Array.isArray(ingredients) || ingredients.length < 3) {
        return res.status(400).json({message : "Please provide at least 3 ingredients"});
    }

    const results = recipes.filter(recipe => {
        const matched = ingredients.filter(i => recipe.ingredients.includes(i));
        const meetsCalories = calories ? recipe.calories <= calories : true;
        return matched.length >= 2 && meetsCalories;
    });
    res.json(results);
};

module.exports = {searchRecipes};
