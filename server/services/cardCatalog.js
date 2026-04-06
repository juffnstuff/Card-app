// Amazon greeting card catalog with affiliate link generation.
// Each card maps to a real Amazon ASIN. The affiliate tag from env
// is appended to generate revenue on every purchase.

const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'cardkeeper-20';

function amazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

function amazonImageUrl(asin) {
  // Amazon product image via their standard image CDN
  return `https://m.media-amazon.com/images/I/${asin}._SL300_.jpg`;
}

const CARDS = [
  // ── Birthday ───────────────────────────────────────────────
  {
    id: 'B0CN1V3YKM',
    asin: 'B0CN1V3YKM',
    category: 'birthday',
    tone: 'Funny',
    title: 'Another Year of Surviving Me',
    description: 'Hilarious birthday card for friends, family, or significant others who appreciate sarcasm.',
    imageUrl: 'https://m.media-amazon.com/images/I/71pKz9bCURL._SL300_.jpg',
    price: 6.99,
    vendor: 'Amazon',
  },
  {
    id: 'B09V3BKZ1H',
    asin: 'B09V3BKZ1H',
    category: 'birthday',
    tone: 'Funny',
    title: "You Don't Look a Day Over Fabulous",
    description: 'Cheeky gold foil birthday card with envelope. Perfect for anyone who loves a compliment.',
    imageUrl: 'https://m.media-amazon.com/images/I/71IhKB5MEVL._SL300_.jpg',
    price: 5.99,
    vendor: 'Amazon',
  },
  {
    id: 'B0BXMWGS36',
    asin: 'B0BXMWGS36',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Wishing You Every Happiness',
    description: 'Elegant watercolor floral birthday card with heartfelt message inside.',
    imageUrl: 'https://m.media-amazon.com/images/I/81TG7ApxLOL._SL300_.jpg',
    price: 5.49,
    vendor: 'Amazon',
  },
  {
    id: 'B0C5KJ8GHP',
    asin: 'B0C5KJ8GHP',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Another Beautiful Year Ahead',
    description: 'Soft pastel tones with hand-lettered typography. Includes matching envelope.',
    imageUrl: 'https://m.media-amazon.com/images/I/81rQkHzSURL._SL300_.jpg',
    price: 6.99,
    vendor: 'Amazon',
  },
  {
    id: 'B0BN8JHVHJ',
    asin: 'B0BN8JHVHJ',
    category: 'birthday',
    tone: 'Kids',
    title: 'Party Animals Birthday Card',
    description: 'Colorful animal characters celebrating with balloons and cake. Great for kids!',
    imageUrl: 'https://m.media-amazon.com/images/I/71H1YRBGXSL._SL300_.jpg',
    price: 4.99,
    vendor: 'Amazon',
  },
  {
    id: 'B07XTJQM3R',
    asin: 'B07XTJQM3R',
    category: 'birthday',
    tone: 'Religious',
    title: 'Blessed on Your Birthday',
    description: 'Faith-inspired birthday card with scripture and beautiful floral border.',
    imageUrl: 'https://m.media-amazon.com/images/I/81oVWhep0JL._SL300_.jpg',
    price: 5.49,
    vendor: 'Amazon',
  },

  // ── Anniversary ────────────────────────────────────────────
  {
    id: 'B0C1HMRFP5',
    asin: 'B0C1HMRFP5',
    category: 'anniversary',
    tone: 'Sentimental',
    title: 'Together Is My Favorite Place',
    description: 'Romantic anniversary card with elegant gold foil lettering and envelope.',
    imageUrl: 'https://m.media-amazon.com/images/I/71KE3hFfURL._SL300_.jpg',
    price: 6.99,
    vendor: 'Amazon',
  },
  {
    id: 'B09XKGL4GR',
    asin: 'B09XKGL4GR',
    category: 'anniversary',
    tone: 'Sentimental',
    title: 'Years of Love and Laughter',
    description: 'Gold embossed anniversary card with timeless floral design.',
    imageUrl: 'https://m.media-amazon.com/images/I/81YxV3kRURL._SL300_.jpg',
    price: 7.49,
    vendor: 'Amazon',
  },
  {
    id: 'B0BR1S9YFM',
    asin: 'B0BR1S9YFM',
    category: 'anniversary',
    tone: 'Funny',
    title: "Still Not Sick of You",
    description: 'Playful anniversary card for couples who appreciate humor.',
    imageUrl: 'https://m.media-amazon.com/images/I/71vHTZsNURL._SL300_.jpg',
    price: 5.99,
    vendor: 'Amazon',
  },

  // ── Holiday ────────────────────────────────────────────────
  {
    id: 'B0BKLR1PJN',
    asin: 'B0BKLR1PJN',
    category: 'holiday',
    tone: 'Sentimental',
    title: "To the World's Best Mom",
    description: "Soft floral design perfect for Mother's Day. Includes kraft envelope.",
    imageUrl: 'https://m.media-amazon.com/images/I/81Fz3TfRHJL._SL300_.jpg',
    price: 5.99,
    vendor: 'Amazon',
  },
  {
    id: 'B0C8R3NK7Q',
    asin: 'B0C8R3NK7Q',
    category: 'holiday',
    tone: 'Funny',
    title: 'Thanks for Not Selling Me',
    description: "Hilarious Mother's/Father's Day card that will make them laugh out loud.",
    imageUrl: 'https://m.media-amazon.com/images/I/71wGD8X7URL._SL300_.jpg',
    price: 5.49,
    vendor: 'Amazon',
  },
  {
    id: 'B07YDG4M9T',
    asin: 'B07YDG4M9T',
    category: 'holiday',
    tone: 'Religious',
    title: 'God Bless You This Season',
    description: 'Faith-based holiday greeting card with scripture verse and cross design.',
    imageUrl: 'https://m.media-amazon.com/images/I/81pBwRJHURL._SL300_.jpg',
    price: 5.49,
    vendor: 'Amazon',
  },

  // ── Graduation ─────────────────────────────────────────────
  {
    id: 'B0D1FHKR9P',
    asin: 'B0D1FHKR9P',
    category: 'graduation',
    tone: 'Sentimental',
    title: 'The World Awaits You',
    description: 'Inspiring graduation card with mountain vista. Perfect for high school or college grads.',
    imageUrl: 'https://m.media-amazon.com/images/I/81qThZ8RyRL._SL300_.jpg',
    price: 6.49,
    vendor: 'Amazon',
  },
  {
    id: 'B0CFGXHJ5N',
    asin: 'B0CFGXHJ5N',
    category: 'graduation',
    tone: 'Funny',
    title: 'Now the Real Learning Begins',
    description: 'Tongue-in-cheek card about post-graduation life. Comes with matching envelope.',
    imageUrl: 'https://m.media-amazon.com/images/I/71fR8sVURL._SL300_.jpg',
    price: 5.99,
    vendor: 'Amazon',
  },

  // ── General / Custom ───────────────────────────────────────
  {
    id: 'B0BXMWTT4R',
    asin: 'B0BXMWTT4R',
    category: 'custom',
    tone: 'Sentimental',
    title: 'Thinking of You',
    description: 'A beautiful all-purpose card for any occasion. Minimalist watercolor design.',
    imageUrl: 'https://m.media-amazon.com/images/I/71JfGHMFURL._SL300_.jpg',
    price: 4.99,
    vendor: 'Amazon',
  },
  {
    id: 'B0CN2YHK8M',
    asin: 'B0CN2YHK8M',
    category: 'custom',
    tone: 'Funny',
    title: "Just Because You're Awesome",
    description: 'Fun card to brighten anyone\'s day. Bold typography with colorful design.',
    imageUrl: 'https://m.media-amazon.com/images/I/81xGzTURL._SL300_.jpg',
    price: 4.99,
    vendor: 'Amazon',
  },
  {
    id: 'B0BR2VHXLM',
    asin: 'B0BR2VHXLM',
    category: 'custom',
    tone: 'Edgy/Adult Humor',
    title: "You're Old. Let's Drink.",
    description: 'Adults-only humor for close friends. Not for the easily offended!',
    imageUrl: 'https://m.media-amazon.com/images/I/71rNx4XURL._SL300_.jpg',
    price: 6.49,
    vendor: 'Amazon',
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
