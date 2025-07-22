import React, { useState, useEffect, useRef } from 'react';
import './IngredientTooltip.css';

const IngredientTooltip = ({ ingredient, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Tooltip content based on ingredient type
  const getTooltipContent = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Common ingredient tips
    const tips = {
      'salt': 'Add salt gradually and taste as you go. Remember: you can always add more, but you can\'t take it out!',
      'pepper': 'Freshly ground black pepper has more flavor than pre-ground. Grind just before using.',
      'garlic': 'Garlic burns easily. Add minced garlic towards the end of cooking to preserve its flavor.',
      'onion': 'Onions release natural sugars when cooked slowly. Caramelized onions add great depth of flavor.',
      'olive oil': 'Extra virgin olive oil is best for finishing dishes. Use regular olive oil for high-heat cooking.',
      'butter': 'Butter adds richness and flavor. For high-heat cooking, use clarified butter or ghee.',
      'flour': 'All-purpose flour is versatile, but bread flour has more protein for chewier results.',
      'sugar': 'Brown sugar adds moisture and caramel flavor. White sugar is better for crisp textures.',
      'eggs': 'Room temperature eggs incorporate better into batters and doughs.',
      'milk': 'Whole milk adds richness, while skim milk reduces calories.',
      'cheese': 'Grate cheese fresh for better melting and flavor.',
      'tomatoes': 'Ripe tomatoes are sweeter and more flavorful. Store at room temperature until ripe.',
      'chicken': 'Chicken breast cooks quickly but can dry out. Thighs are more forgiving and flavorful.',
      'beef': 'Let meat rest after cooking to redistribute juices. Don\'t cut immediately.',
      'fish': 'Fish is done when it flakes easily with a fork. Overcooking makes it dry.',
      'pasta': 'Cook pasta in well-salted water. Reserve some pasta water for sauces.',
      'rice': 'Rinse rice before cooking to remove excess starch for fluffier results.',
      'potatoes': 'Russet potatoes are great for baking, Yukon Gold for mashing, and red potatoes for salads.',
      'carrots': 'Carrots are sweeter when cooked. Raw carrots have more vitamin C.',
      'spinach': 'Spinach wilts dramatically when cooked. Use more than you think you need.',
      'basil': 'Add fresh herbs like basil at the end of cooking to preserve their delicate flavor.',
      'oregano': 'Dried oregano is stronger than fresh. Use about 1/3 the amount of fresh.',
      'thyme': 'Strip thyme leaves from stems before using. The stems can be used to flavor broths.',
      'rosemary': 'Rosemary is very strong. Use sparingly and remove whole sprigs before serving.',
      'lemon': 'Lemon juice brightens flavors. Add zest for even more citrus flavor.',
      'lime': 'Lime juice is more acidic than lemon. Great for balancing rich or spicy dishes.',
      'ginger': 'Fresh ginger adds warmth and spice. Peel with a spoon for less waste.',
      'cinnamon': 'Cinnamon adds warmth to both sweet and savory dishes.',
      'vanilla': 'Pure vanilla extract is worth the investment. Add at the end of cooking.',
      'honey': 'Honey is sweeter than sugar. Use about 3/4 cup honey for every 1 cup sugar.',
      'maple syrup': 'Pure maple syrup has a distinct flavor. Grade A is lighter, Grade B is darker and stronger.',
      'soy sauce': 'Soy sauce adds umami and saltiness. Use low-sodium for better control.',
      'vinegar': 'Vinegar adds acidity and brightness. Different types have different flavors.',
      'mustard': 'Mustard adds tang and helps emulsify dressings and sauces.',
      'mayonnaise': 'Mayonnaise is great for binding and adding creaminess.',
      'breadcrumbs': 'Fresh breadcrumbs are softer, dried breadcrumbs are crunchier.',
      'nuts': 'Toast nuts to enhance their flavor. Watch carefully as they burn easily.',
      'seeds': 'Seeds add crunch and nutrition. Toast them lightly for better flavor.',
      'mushrooms': 'Don\'t wash mushrooms - they absorb water. Wipe with a damp cloth instead.',
      'bell peppers': 'Different colored peppers have different sweetness levels. Red is sweetest.',
      'zucchini': 'Zucchini has high water content. Salt and drain for better texture in some dishes.',
      'eggplant': 'Eggplant can be bitter. Salting helps remove bitterness and excess moisture.',
      'cucumber': 'Cucumbers are mostly water. Great for adding crunch and freshness.',
      'avocado': 'Avocados ripen after picking. Store with bananas to speed up ripening.',
      'banana': 'Bananas continue to ripen after picking. Freeze overripe bananas for smoothies.',
      'apple': 'Apples brown when cut. Toss with lemon juice to prevent browning.',
      'orange': 'Oranges are juicier at room temperature. Roll before juicing for more juice.',
      'strawberry': 'Don\'t wash strawberries until ready to use. They absorb water easily.',
      'blueberry': 'Frozen blueberries work well in baking and don\'t need to be thawed.',
      'chocolate': 'Dark chocolate has less sugar and more antioxidants than milk chocolate.',
      'cocoa': 'Natural cocoa powder is acidic, Dutch-processed is neutral. They\'re not interchangeable.',
      'baking soda': 'Baking soda needs acid to activate. Use with ingredients like buttermilk or lemon juice.',
      'baking powder': 'Baking powder contains its own acid. Use when no acidic ingredients are present.',
      'yeast': 'Active dry yeast needs to be proofed. Instant yeast can be mixed directly into dry ingredients.',
      'cornstarch': 'Cornstarch thickens at high temperatures. Mix with cold liquid before adding.',
      'gelatin': 'Gelatin needs to bloom in cold water before dissolving in hot liquid.',
      'parchment paper': 'Parchment paper prevents sticking and makes cleanup easier.',
      'aluminum foil': 'Aluminum foil conducts heat well and helps with even cooking.',
      'plastic wrap': 'Plastic wrap prevents air exposure and helps maintain freshness.'
    };

    // Find matching tip
    for (const [key, tip] of Object.entries(tips)) {
      if (name.includes(key)) {
        return tip;
      }
    }

    // Default tips based on ingredient categories
    if (name.includes('fresh') || name.includes('herb')) {
      return 'Fresh herbs add bright, vibrant flavors. Add towards the end of cooking to preserve their delicate taste.';
    }
    if (name.includes('dried') || name.includes('powder')) {
      return 'Dried herbs and spices are more concentrated than fresh. Use about 1/3 the amount of fresh equivalents.';
    }
    if (name.includes('organic')) {
      return 'Organic ingredients are grown without synthetic pesticides and fertilizers. They may have better flavor and fewer chemical residues.';
    }
    if (name.includes('extra virgin')) {
      return 'Extra virgin olive oil is the highest quality, made from the first pressing of olives. Best for finishing dishes and dressings.';
    }
    if (name.includes('whole grain') || name.includes('whole wheat')) {
      return 'Whole grain ingredients contain the entire grain kernel, providing more fiber and nutrients than refined grains.';
    }
    if (name.includes('low fat') || name.includes('reduced fat')) {
      return 'Low-fat versions may have different textures and flavors. You might need to adjust cooking times or add moisture.';
    }
    if (name.includes('gluten free')) {
      return 'Gluten-free ingredients may require different cooking techniques. They often need more moisture and binding agents.';
    }
    if (name.includes('vegan') || name.includes('plant based')) {
      return 'Plant-based ingredients are cholesterol-free and often lower in saturated fat. They can be substituted in many traditional recipes.';
    }

    // Generic tips for common ingredient types
    if (name.includes('oil') || name.includes('fat')) {
      return 'Fats carry flavor and help with browning. Different oils have different smoke points for cooking.';
    }
    if (name.includes('spice')) {
      return 'Spices add warmth and complexity. Toast whole spices before grinding for more intense flavor.';
    }
    if (name.includes('vegetable') || name.includes('veggie')) {
      return 'Vegetables add nutrition, color, and texture. Different cooking methods bring out different flavors.';
    }
    if (name.includes('fruit')) {
      return 'Fruits add natural sweetness and acidity. They can balance rich or spicy flavors in dishes.';
    }
    if (name.includes('meat') || name.includes('protein')) {
      return 'Proteins are the building blocks of many dishes. Let meat rest after cooking to redistribute juices.';
    }
    if (name.includes('dairy') || name.includes('milk') || name.includes('cream')) {
      return 'Dairy products add richness and creaminess. Be careful not to boil cream-based sauces as they can curdle.';
    }
    if (name.includes('grain') || name.includes('pasta') || name.includes('rice')) {
      return 'Grains are versatile staples. Cooking in well-salted water enhances their natural flavor.';
    }

    return 'This ingredient adds flavor and nutrition to your dish. Consider how it complements other ingredients in your recipe.';
  };

  const handleMouseEnter = (e) => {
    setShowTooltip(true);
    
    // Calculate position
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 300; // Approximate tooltip width
    const tooltipHeight = 100; // Approximate tooltip height
    
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    let y = rect.bottom + 10;
    
    // Adjust if tooltip would go off screen
    if (x < 10) x = 10;
    if (x + tooltipWidth > window.innerWidth - 10) {
      x = window.innerWidth - tooltipWidth - 10;
    }
    if (y + tooltipHeight > window.innerHeight - 10) {
      y = rect.top - tooltipHeight - 10;
    }
    
    setTooltipPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div 
      className="ingredient-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="ingredient-tooltip"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-ingredient-name">{ingredient}</span>
            <span className="tooltip-icon">💡</span>
          </div>
          <div className="tooltip-content">
            {getTooltipContent(ingredient)}
          </div>
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default IngredientTooltip; 