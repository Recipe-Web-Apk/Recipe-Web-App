const express = require('express');
const axios = require('axios');
const router = express.Router();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Proxy endpoint for searching recipes
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10, // number of results
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Spoonacular' });
  }
});

module.exports = router; 