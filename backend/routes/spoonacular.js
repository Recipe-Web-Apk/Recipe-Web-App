const express = require('express');
const axios = require('axios');
const router = express.Router();

// Test route to check if this router is working
router.get('/test', (req, res) => {
  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  res.json({ message: 'Spoonacular router is working', apiKey: SPOONACULAR_API_KEY ? 'Present' : 'Missing' });
});

// Proxy endpoint for searching recipes
router.get('/search', async (req, res) => {
  const { query, offset = 0 } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
  console.log('API Key:', SPOONACULAR_API_KEY ? 'Present' : 'Missing');
  console.log('Query:', query);
  console.log('Offset:', offset);

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        query,
        apiKey: SPOONACULAR_API_KEY,
        number: 10, // number of results
        offset: parseInt(offset),
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Spoonacular API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch from Spoonacular',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router; 