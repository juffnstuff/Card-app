// Amazon greeting card catalog with affiliate link generation.
// Each card maps to a real Amazon ASIN. The affiliate tag from env
// is appended to generate revenue on every purchase.

const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'cardkeeper-20';

function amazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

// Amazon Associates image widget — officially sanctioned for affiliates
function amazonImageUrl(asin) {
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=${AFFILIATE_TAG}`;
}

const CARDS = [
  // ═══════════════════════════════════════════════════════════
  // BIRTHDAY
  // ═══════════════════════════════════════════════════════════

  // Birthday · Funny
  {
    id: 'B07DWJPTZM',
    asin: 'B07DWJPTZM',
    category: 'birthday',
    tone: 'Funny',
    title: 'Hallmark Shoebox — Loved Me',
    description: 'Funny birthday card for a spouse with hand-lettered illustrations and a humorous twist.',
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
  {
    id: 'B086DCGSCH',
    asin: 'B086DCGSCH',
    category: 'birthday',
    tone: 'Funny',
    title: 'Hallmark Shoebox — Marie Antoinette',
    description: 'Vintage portrait with metallic foil and a humorous message about cake and peasants.',
    price: 5.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B08D54CN4Z',
    asin: 'B08D54CN4Z',
    category: 'birthday',
    tone: 'Funny',
    title: 'Hallmark — Intelligent, Witty, Charming',
    description: 'Deadpan monkey illustration with foil lettering. Hilariously self-deprecating.',
    price: 4.99,
    vendor: 'Hallmark',
  },

  // Birthday · Sentimental
  {
    id: 'B01M0YR5C2',
    asin: 'B01M0YR5C2',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark — Live Life to the Fullest',
    description: 'Heartfelt birthday card with cupcake design and warm wishes inside.',
    price: 4.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B09RND4QD3',
    asin: 'B09RND4QD3',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark Romantic — With You Beside Me',
    description: 'Elegant copper-leaf birthday card with romantic sentiment for a spouse or partner.',
    price: 6.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B07K3JQ523',
    asin: 'B07K3JQ523',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark Signature — So Lovely',
    description: 'Premium birthday card with beautiful design. 5x7 with coordinating envelope.',
    price: 7.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B072MMDLPN',
    asin: 'B072MMDLPN',
    category: 'birthday',
    tone: 'Sentimental',
    title: 'Hallmark Signature — Every Day Love You',
    description: 'Romantic heart-themed birthday card for someone you love.',
    price: 7.99,
    vendor: 'Hallmark',
  },

  // Birthday · Kids
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
  {
    id: 'B0DS2VL47D',
    asin: 'B0DS2VL47D',
    category: 'birthday',
    tone: 'Kids',
    title: 'Hallmark Kids — High Five Decal',
    description: 'Interactive birthday card with sticker for son, daughter, or grandchild.',
    price: 3.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B0DJV41NMG',
    asin: 'B0DJV41NMG',
    category: 'birthday',
    tone: 'Kids',
    title: 'Hallmark Kids — Start Celebrating',
    description: 'Bold bright letters with holographic accents. Great for tweens and teens.',
    price: 3.99,
    vendor: 'Hallmark',
  },

  // Birthday · Religious
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
  {
    id: 'B07QBDHNH6',
    asin: 'B07QBDHNH6',
    category: 'birthday',
    tone: 'Religious',
    title: 'Hallmark DaySpring — Blessings on Your Birthday',
    description: 'Beautiful faith-based card with scripture and floral border.',
    price: 4.49,
    vendor: 'Hallmark DaySpring',
  },

  // ═══════════════════════════════════════════════════════════
  // ANNIVERSARY
  // ═══════════════════════════════════════════════════════════

  // Anniversary · Sentimental
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

  // Anniversary · Funny
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
  {
    id: 'B081QWXLL4',
    asin: 'B081QWXLL4',
    category: 'anniversary',
    tone: 'Funny',
    title: 'NobleWorks — Special Password',
    description: 'Hilarious marriage humor anniversary card. Single card with envelope.',
    price: 4.99,
    vendor: 'NobleWorks',
  },
  {
    id: 'B087D8T93N',
    asin: 'B087D8T93N',
    category: 'anniversary',
    tone: 'Funny',
    title: 'NobleWorks — Always Right',
    description: 'Funny anniversary card for wife. "This is the card my wife told me to buy."',
    price: 4.99,
    vendor: 'NobleWorks',
  },

  // ═══════════════════════════════════════════════════════════
  // HOLIDAY (Mother's Day, Father's Day, Christmas, etc.)
  // ═══════════════════════════════════════════════════════════

  // Holiday · Sentimental
  {
    id: 'B083YR78KN',
    asin: 'B083YR78KN',
    category: 'holiday',
    tone: 'Sentimental',
    title: "Hallmark Signature — All Kinds of Beautiful",
    description: "Mother's Day card with flower wreath design and sweet message.",
    price: 7.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B07MFWFKPX',
    asin: 'B07MFWFKPX',
    category: 'holiday',
    tone: 'Sentimental',
    title: 'Hallmark Signature — All the Happiness You Bring',
    description: "Stunning floral Mother's Day card with heartfelt wishes.",
    price: 7.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B07P9FJSZS',
    asin: 'B07P9FJSZS',
    category: 'holiday',
    tone: 'Sentimental',
    title: "Hallmark — Beautiful Tomorrows (Father's Day)",
    description: "Sentimental Father's Day card for husband with lovely design.",
    price: 5.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B08BGS3JYV',
    asin: 'B08BGS3JYV',
    category: 'holiday',
    tone: 'Sentimental',
    title: 'Hallmark — Holiday Lights (Christmas)',
    description: 'Single Christmas card with warm holiday lights design.',
    price: 4.99,
    vendor: 'Hallmark',
  },

  // Holiday · Funny
  {
    id: 'B0DS2TYQV2',
    asin: 'B0DS2TYQV2',
    category: 'holiday',
    tone: 'Funny',
    title: 'Hallmark Good Mail — Cinnamon Roll Model',
    description: '"Sorry to get all cinnamental." Works for Mother\'s/Father\'s Day.',
    price: 5.49,
    vendor: 'Hallmark',
  },
  {
    id: 'B079Z9L5TZ',
    asin: 'B079Z9L5TZ',
    category: 'holiday',
    tone: 'Funny',
    title: "Hallmark Shoebox — Fish in Hat (Father's Day)",
    description: "Funny Father's Day card with clever message and Shoebox humor.",
    price: 4.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B01LZ0VSM9',
    asin: 'B01LZ0VSM9',
    category: 'holiday',
    tone: 'Funny',
    title: 'Hallmark — Romantic Penguins (Christmas)',
    description: 'Funny romantic Christmas card for your significant other. Adorable penguin design.',
    price: 5.99,
    vendor: 'Hallmark',
  },

  // Holiday · Religious
  {
    id: 'B0FRB5B86R',
    asin: 'B0FRB5B86R',
    category: 'holiday',
    tone: 'Religious',
    title: 'Shared Blessings — Floral Heart Anniversary',
    description: 'Christian greeting card with NIV scripture and faith-inspired floral artwork.',
    price: 4.99,
    vendor: 'Shared Blessings',
  },

  // ═══════════════════════════════════════════════════════════
  // GRADUATION
  // ═══════════════════════════════════════════════════════════

  // Graduation · Sentimental
  {
    id: 'B0BRTDWR38',
    asin: 'B0BRTDWR38',
    category: 'graduation',
    tone: 'Sentimental',
    title: 'Hallmark — Congratulations (Inspired)',
    description: 'Inspiring graduation card about setting sights on something big and committing to it.',
    price: 4.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B0DSBLHTGP',
    asin: 'B0DSBLHTGP',
    category: 'graduation',
    tone: 'Sentimental',
    title: 'MENANA — Happy Graduate',
    description: 'Inspiring graduation card for him or her. High school or college grads.',
    price: 5.99,
    vendor: 'MENANA',
  },

  // Graduation · Funny
  {
    id: 'B08YJQ4BFF',
    asin: 'B08YJQ4BFF',
    category: 'graduation',
    tone: 'Funny',
    title: 'Wunderkid — You Rock!',
    description: 'Cute and funny graduation card. Blank inside for your personal message.',
    price: 5.49,
    vendor: 'Wunderkid',
  },
  {
    id: 'B07CP3PL1V',
    asin: 'B07CP3PL1V',
    category: 'graduation',
    tone: 'Funny',
    title: 'NobleWorks — Dragon Graduate',
    description: 'Hilarious cartoon dragon graduation card. 5x7 with envelope.',
    price: 4.49,
    vendor: 'NobleWorks',
  },
  {
    id: 'B0GCHKNNGG',
    asin: 'B0GCHKNNGG',
    category: 'graduation',
    tone: 'Funny',
    title: 'Podagree — Mayo Dreams Come True',
    description: 'Cute food pun graduation card. Folded 5.3x8 with envelope.',
    price: 4.99,
    vendor: 'Podagree',
  },

  // ═══════════════════════════════════════════════════════════
  // CUSTOM / GENERAL PURPOSE
  // ═══════════════════════════════════════════════════════════

  // Custom · Sentimental
  {
    id: 'B07C9Q7B58',
    asin: 'B07C9Q7B58',
    category: 'custom',
    tone: 'Sentimental',
    title: 'American Greetings — Thinking of You (Floral)',
    description: 'Beautiful all-purpose card with delicate floral design.',
    price: 4.06,
    vendor: 'American Greetings',
  },
  {
    id: 'B08JCWP611',
    asin: 'B08JCWP611',
    category: 'custom',
    tone: 'Sentimental',
    title: 'Hallmark — Good Vibes',
    description: '"Big hugs. Happy thoughts. Good vibes." Get well / thinking of you card.',
    price: 3.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B01LY1M80T',
    asin: 'B01LY1M80T',
    category: 'custom',
    tone: 'Sentimental',
    title: 'Hallmark — Thankful for You',
    description: 'Thank you card for nurses, teachers, healthcare workers, or anyone special.',
    price: 3.99,
    vendor: 'Hallmark',
  },

  // Custom · Funny
  {
    id: 'B0B3YCWYW5',
    asin: 'B0B3YCWYW5',
    category: 'custom',
    tone: 'Funny',
    title: 'NobleWorks — Hold The Elevator',
    description: 'Hilarious all-occasion card with dog and cat cartoon. 5x7 with envelope.',
    price: 4.49,
    vendor: 'NobleWorks',
  },
  {
    id: 'B0B3YZ6D5P',
    asin: 'B0B3YZ6D5P',
    category: 'custom',
    tone: 'Funny',
    title: 'NobleWorks — Cursing Parrot',
    description: 'Hilarious all-occasion blank card with colorful parrot cartoon. Adult humor.',
    price: 4.49,
    vendor: 'NobleWorks',
  },

  // Custom · Edgy/Adult Humor
  {
    id: 'B07D4QKLM5',
    asin: 'B07D4QKLM5',
    category: 'custom',
    tone: 'Edgy/Adult Humor',
    title: 'NobleWorks — Pain Makes You Stronger',
    description: 'Retro adult humor card. Not for the easily offended! With envelope.',
    price: 4.99,
    vendor: 'NobleWorks',
  },
  {
    id: 'B00EZEKLXS',
    asin: 'B00EZEKLXS',
    category: 'custom',
    tone: 'Edgy/Adult Humor',
    title: 'NobleWorks — Too High for Grown-Ups',
    description: 'Irreverent all-occasion blank card. Bold adult humor with 5x7 envelope.',
    price: 4.49,
    vendor: 'NobleWorks',
  },

  // ═══════════════════════════════════════════════════════════
  // NEW BABY (bonus category)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'B01M0Z2W4R',
    asin: 'B01M0Z2W4R',
    category: 'custom',
    tone: 'Funny',
    title: 'Hallmark Studio Ink — Made a Human',
    description: '"You made a human!" Funny congratulations card for new parents.',
    price: 5.99,
    vendor: 'Hallmark',
  },
  {
    id: 'B072MMD4TZ',
    asin: 'B072MMD4TZ',
    category: 'custom',
    tone: 'Sentimental',
    title: 'Hallmark Signature — Baby Shower (Clothes)',
    description: 'Beautiful baby shower card with tiny clothes design. Welcome new baby.',
    price: 7.99,
    vendor: 'Hallmark',
  },
];

// Attach affiliate URLs and image URLs to each card
const CARD_CATALOG = CARDS.map((card) => ({
  ...card,
  affiliateUrl: amazonUrl(card.asin),
  imageUrl: amazonImageUrl(card.asin),
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

module.exports = { searchCards, CARD_CATALOG, amazonUrl, amazonImageUrl, AFFILIATE_TAG };
