const express = require('express');
const { authenticate } = require('../middleware/auth');
const { FLOWERS, searchFlowers } = require('../services/flowerCatalog');

const router = express.Router();

router.use(authenticate);

// POST /api/flowers/recommend — AI-powered flower suggestions + optional local florist
router.post('/recommend', async (req, res, next) => {
  try {
    const { contactName, relationship, occasion, eventLabel, contactAddress } = req.body;

    // Build compact catalog summary for Claude
    const catalogSummary = FLOWERS.map((f) => ({
      id: f.id,
      vendor: f.vendor,
      title: f.title,
      description: f.description,
      price: f.price,
      category: f.category,
      occasions: f.occasions,
    }));

    let recommendations = [];
    let aiPowered = false;

    // Try AI recommendation
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const isValentines = eventLabel && eventLabel.toLowerCase().includes('valentine');
        const prompt = `You are a flower recommendation expert helping someone pick the perfect flowers.

Recipient details:
- Name: ${contactName || 'Unknown'}
- Relationship: ${relationship || 'Unknown'}
- Occasion: ${eventLabel || occasion || 'general'}
${isValentines ? '- This is for VALENTINE\'S DAY — prioritize romantic, impressive arrangements. This should be a big deal!' : ''}

Here is the flower catalog (JSON):
${JSON.stringify(catalogSummary)}

Pick the 3-4 BEST flower arrangements for this recipient and occasion. Consider the relationship and occasion carefully.
${isValentines ? 'For Valentine\'s Day, lean heavily toward romantic options — roses, luxury arrangements, etc.' : ''}

Return ONLY a JSON array of objects with "id" (from catalog) and "reason" (1 sentence why these flowers are perfect). No other text.`;

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const responseText = message.content[0].text.trim();
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const picks = JSON.parse(jsonMatch[0]);
          recommendations = picks
            .map((pick) => {
              const flower = FLOWERS.find((f) => f.id === pick.id);
              if (!flower) return null;
              return { ...flower, reason: pick.reason };
            })
            .filter(Boolean);

          if (recommendations.length > 0) aiPowered = true;
        }
      } catch (aiErr) {
        console.error('[AI Flowers] Error:', aiErr.message);
      }
    }

    // Fallback: filter by occasion
    if (recommendations.length === 0) {
      let occasionKey = occasion || 'custom';
      if (eventLabel && eventLabel.toLowerCase().includes('valentine')) occasionKey = 'valentine';
      else if (eventLabel && eventLabel.toLowerCase().includes('anniversary')) occasionKey = 'anniversary';

      const filtered = searchFlowers({ occasion: occasionKey });
      recommendations = (filtered.length > 0 ? filtered : FLOWERS).slice(0, 4).map((f) => ({ ...f, reason: '' }));
    }

    // Google Places local florist search
    let localShop = null;
    if (process.env.GOOGLE_MAPS_API_KEY && contactAddress) {
      try {
        localShop = await findLocalFlorist(contactAddress);
      } catch (err) {
        console.error('[Google Places] Error finding local florist:', err.message);
      }
    }

    res.json({ recommendations, localShop, aiPowered });
  } catch (err) {
    next(err);
  }
});

// Search Google Places for a flower shop near the contact's address
async function findLocalFlorist(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !address) return null;

  const query = encodeURIComponent(`flower shop near ${address}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    const top = data.results[0];
    const placeId = top.place_id;
    return {
      name: top.name,
      address: top.formatted_address,
      rating: top.rating || null,
      url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    };
  }

  return null;
}

module.exports = router;
