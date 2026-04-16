const express = require('express');
const { authenticate } = require('../middleware/auth');
const { searchCards, CARD_CATALOG } = require('../services/cardCatalog');
const { getItemsByAsins, isConfigured: paapiConfigured } = require('../services/paapi');

const router = express.Router();

router.use(authenticate);

// Enrich catalog cards with live PA-API data (images, prices, availability)
async function enrichCards(cards) {
  if (!paapiConfigured() || cards.length === 0) return cards;

  try {
    const asins = cards.map((c) => c.asin).filter(Boolean);
    const liveData = await getItemsByAsins(asins);

    return cards.map((card) => {
      const live = liveData[card.asin];
      if (!live) return card;
      return {
        ...card,
        imageUrl: live.imageUrl || card.imageUrl,
        price: live.priceValue != null ? parseFloat(live.priceValue) : card.price,
        availability: live.availability || undefined,
      };
    });
  } catch (err) {
    console.error('[Cards] PA-API enrichment failed, using catalog defaults:', err.message);
    return cards;
  }
}

// GET /api/cards/search?category=birthday&tone=Funny
router.get('/search', async (req, res, next) => {
  try {
    const { category, tone } = req.query;
    let cards = await searchCards({ category, tone });
    cards = await enrichCards(cards);
    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

// POST /api/cards/recommend — AI-powered card suggestions using Claude
router.post('/recommend', async (req, res, next) => {
  try {
    const { contactId, dateId, occasion, relationship, tone, isMother, isFather, contactName } = req.body;

    // Build card catalog summary for Claude (compact to save tokens)
    const catalogSummary = CARD_CATALOG.map((c) => ({
      id: c.id,
      category: c.category,
      tone: c.tone,
      title: c.title,
      description: c.description,
      price: c.price,
      vendor: c.vendor,
    }));

    // Try AI recommendation if API key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const prompt = `You are a greeting card recommendation expert. A user needs to pick a card for someone.

Recipient details:
- Name: ${contactName || 'Unknown'}
- Relationship: ${relationship || 'Unknown'}
- Preferred tone: ${tone || 'Any'}
- Occasion: ${occasion || 'general'}
${isMother ? '- This person is a mother (consider Mother\'s Day appropriate cards)' : ''}
${isFather ? '- This person is a father (consider Father\'s Day appropriate cards)' : ''}

Here is the full card catalog (JSON):
${JSON.stringify(catalogSummary)}

Pick the 3-5 BEST cards for this recipient and occasion. Consider the relationship, tone preference, and occasion carefully.

Return ONLY a JSON array of objects with "id" (card id from catalog) and "reason" (1 sentence explaining why this card is perfect for this person). No other text.`;

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const responseText = message.content[0].text.trim();
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const picks = JSON.parse(jsonMatch[0]);
          const recommendations = picks
            .map((pick) => {
              const card = CARD_CATALOG.find((c) => c.id === pick.id);
              if (!card) return null;
              return { ...card, reason: pick.reason };
            })
            .filter(Boolean);

          if (recommendations.length > 0) {
            const enriched = await enrichCards(recommendations);
            return res.json({ recommendations: enriched, aiPowered: true });
          }
        }
      } catch (aiErr) {
        console.error('[AI Recommend] Error:', aiErr.message);
        // Fall through to category+tone fallback
      }
    }

    // Fallback: filter by category and tone
    let fallback = [...CARD_CATALOG];
    if (occasion) fallback = fallback.filter((c) => c.category === occasion.toLowerCase());
    if (tone) fallback = fallback.filter((c) => c.tone.toLowerCase() === tone.toLowerCase());
    if (fallback.length === 0) fallback = CARD_CATALOG.slice(0, 5);
    let recommendations = fallback.slice(0, 5).map((c) => ({ ...c, reason: '' }));
    recommendations = await enrichCards(recommendations);

    res.json({ recommendations, aiPowered: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
