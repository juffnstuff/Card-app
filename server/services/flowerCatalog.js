// Online flower delivery catalog with curated options organized by occasion.
// Similar structure to cardCatalog.js. URLs are direct links to popular flower vendors.

const FLOWERS = [
  // ═══════════════════════════════════════════════════════════
  // ROMANTIC (Valentine's Day, Anniversary)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ftd-roses-classic',
    vendor: 'FTD',
    title: 'Classic Red Rose Bouquet',
    description: 'Timeless dozen red roses, hand-arranged with greenery. The ultimate romantic gesture.',
    price: 49.99,
    category: 'romantic',
    occasions: ['valentine', 'anniversary'],
    url: 'https://www.ftd.com/roses',
  },
  {
    id: '1800-romance-bouquet',
    vendor: '1-800-Flowers',
    title: 'Magnificent Roses',
    description: 'Premium long-stem roses in a classic glass vase. Available in red, pink, or mixed.',
    price: 59.99,
    category: 'romantic',
    occasions: ['valentine', 'anniversary'],
    url: 'https://www.1800flowers.com/roses',
  },
  {
    id: 'bouqs-valentines',
    vendor: 'The Bouqs Co.',
    title: 'Volcano-Grown Red Roses',
    description: 'Farm-fresh roses grown on the slopes of an active volcano. Sustainably sourced.',
    price: 54.00,
    category: 'romantic',
    occasions: ['valentine', 'anniversary'],
    url: 'https://bouqs.com/flowers/roses',
  },
  {
    id: 'urbanstems-valentine',
    vendor: 'UrbanStems',
    title: 'The Juliet',
    description: 'Lush arrangement of roses, ranunculus, and seasonal blooms in soft pinks and reds.',
    price: 65.00,
    category: 'romantic',
    occasions: ['valentine', 'anniversary'],
    url: 'https://urbanstems.com/products/flowers',
  },
  {
    id: 'proflowers-romance',
    vendor: 'ProFlowers',
    title: 'Two Dozen Red Roses',
    description: 'Show-stopping double dozen red roses with baby\'s breath. Free glass vase included.',
    price: 69.99,
    category: 'romantic',
    occasions: ['valentine', 'anniversary'],
    url: 'https://www.proflowers.com/roses',
  },

  // ═══════════════════════════════════════════════════════════
  // CELEBRATION (Birthday, Graduation)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ftd-birthday-bright',
    vendor: 'FTD',
    title: 'Birthday Brights Bouquet',
    description: 'Cheerful mix of sunflowers, daisies, and colorful blooms that scream celebration.',
    price: 44.99,
    category: 'celebration',
    occasions: ['birthday', 'graduation'],
    url: 'https://www.ftd.com/birthday-flowers',
  },
  {
    id: '1800-happy-birthday',
    vendor: '1-800-Flowers',
    title: 'Happy Birthday Bouquet',
    description: 'Vibrant orange roses, hot pink carnations, and yellow daisies in a festive arrangement.',
    price: 49.99,
    category: 'celebration',
    occasions: ['birthday', 'graduation'],
    url: 'https://www.1800flowers.com/birthday-flowers',
  },
  {
    id: 'bouqs-sunshine',
    vendor: 'The Bouqs Co.',
    title: 'Sunshine & Smiles',
    description: 'Bright sunflowers and cheerful blooms. Perfect for making someone\'s day.',
    price: 48.00,
    category: 'celebration',
    occasions: ['birthday', 'graduation'],
    url: 'https://bouqs.com/flowers/birthday',
  },
  {
    id: 'urbanstems-celebrate',
    vendor: 'UrbanStems',
    title: 'The Dawn',
    description: 'Cheerful mix of peach roses, ranunculus, and seasonal greenery.',
    price: 55.00,
    category: 'celebration',
    occasions: ['birthday', 'graduation'],
    url: 'https://urbanstems.com/products/flowers',
  },

  // ═══════════════════════════════════════════════════════════
  // SPRING / GENERAL (Mother's Day, Holiday, Custom)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'ftd-spring-garden',
    vendor: 'FTD',
    title: 'Spring Garden Bouquet',
    description: 'Pastel tulips, lilies, and hydrangea. Perfect for springtime occasions.',
    price: 54.99,
    category: 'spring',
    occasions: ['holiday', 'custom', 'birthday'],
    url: 'https://www.ftd.com/spring-flowers',
  },
  {
    id: '1800-mothers-embrace',
    vendor: '1-800-Flowers',
    title: "Garden Embrace Bouquet",
    description: "Soft pink roses, white lilies, and lavender stock. Perfect for Mom or any special woman.",
    price: 54.99,
    category: 'spring',
    occasions: ['holiday', 'custom'],
    url: 'https://www.1800flowers.com/mothers-day-flowers',
  },
  {
    id: 'bouqs-wildflower',
    vendor: 'The Bouqs Co.',
    title: 'Wildflower Mix',
    description: 'Whimsical wildflower arrangement with seasonal blooms. Eco-friendly farm sourced.',
    price: 46.00,
    category: 'spring',
    occasions: ['holiday', 'custom', 'birthday'],
    url: 'https://bouqs.com/flowers/wildflowers',
  },
  {
    id: 'urbanstems-classic',
    vendor: 'UrbanStems',
    title: 'The Classic',
    description: 'Elegant arrangement of white and green blooms. Versatile for any occasion.',
    price: 50.00,
    category: 'spring',
    occasions: ['custom', 'holiday'],
    url: 'https://urbanstems.com/products/flowers',
  },

  // ═══════════════════════════════════════════════════════════
  // PREMIUM / LUXURY
  // ═══════════════════════════════════════════════════════════
  {
    id: 'bloomnation-luxury',
    vendor: 'BloomNation',
    title: 'Luxury Rose Box',
    description: 'Preserved roses in an elegant box. Last up to a year. Ultimate luxury gift.',
    price: 89.99,
    category: 'luxury',
    occasions: ['valentine', 'anniversary', 'birthday'],
    url: 'https://www.bloomnation.com/flower-delivery',
  },
  {
    id: 'venus-et-fleur',
    vendor: 'Venus ET Fleur',
    title: 'Eternity Roses',
    description: 'Handcrafted arrangement of Eternity Roses that last a year or more. Premium keepsake.',
    price: 119.00,
    category: 'luxury',
    occasions: ['valentine', 'anniversary'],
    url: 'https://www.venusetfleur.com',
  },
  {
    id: 'farmgirl-flowers',
    vendor: 'Farmgirl Flowers',
    title: "Burlap-Wrapped Bouquet",
    description: 'Locally sourced, seasonally inspired bouquet wrapped in burlap. Supporting US farms.',
    price: 58.00,
    category: 'general',
    occasions: ['birthday', 'holiday', 'custom', 'valentine'],
    url: 'https://farmgirlflowers.com',
  },
  {
    id: 'fromyouflowers-sympathy',
    vendor: 'From You Flowers',
    title: 'Peaceful Wishes Arrangement',
    description: 'White lilies, roses, and chrysanthemums in a serene arrangement.',
    price: 42.99,
    category: 'sympathy',
    occasions: ['custom'],
    url: 'https://www.fromyouflowers.com/sympathy-flowers',
  },
];

// Map occasion types to flower catalog categories
function mapOccasionToCategory(occasion) {
  const mapping = {
    valentine: 'romantic',
    anniversary: 'romantic',
    birthday: 'celebration',
    graduation: 'celebration',
    holiday: 'spring',
    custom: 'spring',
  };
  return mapping[occasion] || null;
}

function searchFlowers({ occasion, category } = {}) {
  let results = [...FLOWERS];

  if (occasion) {
    results = results.filter((f) => f.occasions.includes(occasion.toLowerCase()));
  }
  if (category) {
    results = results.filter((f) => f.category === category.toLowerCase());
  }

  return results;
}

module.exports = { FLOWERS, searchFlowers, mapOccasionToCategory };
