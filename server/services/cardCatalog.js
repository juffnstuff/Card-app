// Amazon greeting card catalog with affiliate link generation.
// Each card maps to a real Amazon ASIN. The affiliate tag from env
// is appended to generate revenue on every purchase.

const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'cardkeeper-20';

function amazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

const CARDS = [
  // ── Birthday · Funny ──────────────────────────────────────
  {
    id: 'B07DWJPTZM',
    asin: 'B07DWJPTZM',
    category: 'birthday',
    tone: 'Funny',
    title: 'Hallmark Shoebox — Loved Me',
    description: 'Funny birthday card for husband with hand-lettered illustrations and a humorous twist.',
    price: 5.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B01M0NACQ7',
    asin: 'B01M0NACQ7',
    category: 'birthday',
    tone: 'Funny',
    title: 'Hallmark Shoebox — Cracks About Your Age',
    description: 'Sarcastic humor birthday card. Perfect for anyone who can laugh at getting older.',
    price: 5.49,
    vendor: 'Hallmark',
  },

  // ── Birthday · Sentimental ─────────────────────────────────
  {
    id: 'B01M0YR5C2',
    asin: 'B01M0YR5C2',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark — Live Life to the Fullest',
    description: 'Heartfelt birthday card with snowy cupcake design and warm wishes inside.',
    price: 4.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B09RND4QD3',
    asin: 'B09RND4QD3',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark Romantic — With You Beside Me',
    description: 'Elegant copper-leaf birthday card with romantic sentiment. Great for a spouse or partner.',
    price: 6.99,
    vendor: 'Hallmark',
  },

  // ── Birthday · Kids ────────────────────────────────────────
  {
    id: 'B0DS2VPV3N',
    asin: 'B0DS2VPV3N',
    category: 'birthday',
    tone: 'Kids',
    title: 'Hallmark Kids — Toadally Cool',
    description: 'Fun frog-themed birthday card for son, daughter, or grandchild.',
    price: 3.99,
    vendor: 'Hallmark',
  },

  // ── Birthday · Religious ───────────────────────────────────
  {
    id: 'B07QJQZVNM',
    asin: 'B07QJQZVNM',
    category: 'birthday',
    tone: 'Religious',
    title: 'Hallmark DaySpring — Celebrating You',
    description: 'Faith-inspired birthday card with scripture and a joyful floral design.',
    price: 4.49,
    vendor: 'Hallmark DaySpring',
  },

  // ── Anniversary · Sentimental ──────────────────────────────
  {
    id: 'B072MMD2JL',
    asin: 'B072MMD2JL',
    category: 'anniversary',
    tone: 'Sentimental',
    title: 'Hallmark Signature — Happy Anniversary',
    description: 'Elegant anniversary card for a couple with refined design and heartfelt message.',
    price: 7.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B016055W88',
    asin: 'B016055W88',
    category: 'anniversary',
    tone: 'Sentimental',
    title: 'American Greetings — Romantic Anniversary',
    description: 'Romantic anniversary greeting card with warm illustration and loving words.',
    price: 5.99,
    vendor: 'American Greetings',
  },

  // ── Anniversary · Funny ────────────────────────────────────
  {
    id: 'B07SK9NC4S',
    asin: 'B07SK9NC4S',
    category: 'anniversary',
    tone: 'Funny',
    title: 'NobleWorks — Stick It Out',
    description: 'Playful anniversary card for couples who appreciate humor. 5x7 with envelope.',
    price: 4.99,
    vendor: 'NobleWorks',
  },

  // ── Holiday · Sentimental (Mother's Day) ───────────────────
  {
    id: 'B083YR78KN',
    asin: 'B083YR78KN',
    category: 'holiday',
    tone: 'Sentimental',
    title: "Hallmark Signature — All Kinds of Beautiful",
    description: "Beautiful Mother's Day card with flower wreath design and sweet message.",
    price: 7.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B07MFWFKPX',
    asin: 'B07MFWFKPX',
    category: 'holiday',
    tone: 'Sentimental',
    title: 'Hallmark Signature — All the Happiness You Bring',
    description: "Stunning floral Mother's Day card with heartfelt wishes inside.",
    price: 7.99,
    vendor: 'Hallmark',
  },

  // ── Holiday · Funny ────────────────────────────────────────
  {
    id: 'B0DS2TYQV2',
    asin: 'B0DS2TYQV2',
    category: 'holiday',
    tone: 'Funny',
    title: 'Hallmark Good Mail — Cinnamon Roll Model',
    description: "Punny card for Mother's Day, Father's Day, or appreciation. \"Sorry to get all cinnamental.\"",
    price: 5.49,
    vendor: 'Hallmark',
  },

  // ── Holiday · Religious ────────────────────────────────────
  {
    id: 'B07QBDHNH6',
    asin: 'B07QBDHNH6',
    category: 'holiday',
    tone: 'Religious',
    title: 'Hallmark DaySpring — Blessings on Your Birthday',
    description: 'Faith-based card with scripture and beautiful floral border. Works for holidays too.',
    price: 4.49,
    vendor: 'Hallmark DaySpring',
  },

  // ── Graduation · Sentimental ───────────────────────────────
  {
    id: 'B0DSBLHTGP',
    asin: 'B0DSBLHTGP',
    category: 'graduation',
    tone: 'Sentimental',
    title: 'MENANA — Happy Graduate',
    description: 'Inspiring graduation card for him or her. Perfect for high school or college grads.',
    price: 5.99,
    vendor: 'MENANA',
  },

  // ── Graduation · Funny ─────────────────────────────────────
  {
    id: 'B08YJQ4BFF',
    asin: 'B08YJQ4BFF',
    category: 'graduation',
    tone: 'Funny',
    title: 'Wunderkid — You Rock!',
    description: 'Cute and funny graduation card. Single card, blank inside for your personal message.',
    price: 5.49,
    vendor: 'Wunderkid',
  },

  // ── Custom / General · Sentimental ─────────────────────────
  {
    id: 'B07C9Q7B58',
    asin: 'B07C9Q7B58',
    category: 'custom',
    tone: 'Sentimental',
    title: 'American Greetings — Thinking of You (Floral)',
    description: 'A beautiful all-purpose card for any occasion with delicate floral design.',
    price: 4.06,
    vendor: 'American Greetings',
  },

  // ── Custom / General · Funny ───────────────────────────────
  {
    id: 'B0B3YCWYW5',
    asin: 'B0B3YCWYW5',
    category: 'custom',
    tone: 'Funny',
    title: 'NobleWorks — Hold The Elevator',
    description: 'Hilarious all-occasion blank card featuring a dog and cat cartoon. 5x7 with envelope.',
    price: 4.49,
    vendor: 'NobleWorks',
  },

  // ── Custom / General · Edgy/Adult Humor ────────────────────
  {
    id: 'B07D4QKLM5',
    asin: 'B07D4QKLM5',
    category: 'custom',
    tone: 'Edgy/Adult Humor',
    title: 'NobleWorks — Pain Makes You Stronger',
    description: 'Retro adult humor card. Not for the easily offended! Single card with envelope.',
    price: 4.99,
    vendor: 'NobleWorks',
  },
];

// Attach affiliate URLs to each card at export time
const CARD_CATALOG = CARDS.map((card) => ({
  ...card,
  affiliateUrl: amazonUrl(card.asin),
}));

async function searchCards({ category, tone } = {}) {
  let results = [...CARD_CATALOG];

  if (category) {
    results = results.filter((c) => c.category === category.toLowerCase());
  }
  if (tone) {
    results = results.filter((c) => c.tone.toLowerCase() === tone.toLowerCase());
  }

  return results;
}

module.exports = { searchCards, CARD_CATALOG, amazonUrl, AFFILIATE_TAG };
