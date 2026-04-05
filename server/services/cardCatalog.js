// DECISION: Fully stubbed card catalog. Replace this with real API calls to Hallmark, Amazon Product API, or a card vendor.
// The interface is: searchCards({ category, tone }) => Promise<Card[]>

const MOCK_CARDS = [
  // Birthday cards
  { id: 'card-001', category: 'birthday', tone: 'Funny', title: 'Another Year Closer to Seniorhood', description: 'Humorous take on aging with playful illustrations.', imageUrl: '/cards/birthday-funny-1.jpg', price: 5.99, vendor: 'MockCards' },
  { id: 'card-002', category: 'birthday', tone: 'Funny', title: 'You Don\'t Look a Day Over Fabulous', description: 'Bright and cheeky birthday card with gold foil.', imageUrl: '/cards/birthday-funny-2.jpg', price: 6.49, vendor: 'MockCards' },
  { id: 'card-003', category: 'birthday', tone: 'Sentimental', title: 'Wishing You Every Happiness', description: 'Elegant watercolor floral design with heartfelt message.', imageUrl: '/cards/birthday-sentimental-1.jpg', price: 5.49, vendor: 'MockCards' },
  { id: 'card-004', category: 'birthday', tone: 'Sentimental', title: 'Another Beautiful Year', description: 'Soft pastel tones with hand-lettered typography.', imageUrl: '/cards/birthday-sentimental-2.jpg', price: 6.99, vendor: 'MockCards' },
  { id: 'card-005', category: 'birthday', tone: 'Kids', title: 'Party Animals!', description: 'Colorful animal characters celebrating with balloons and cake.', imageUrl: '/cards/birthday-kids-1.jpg', price: 4.99, vendor: 'MockCards' },
  { id: 'card-006', category: 'birthday', tone: 'Religious', title: 'Blessed on Your Birthday', description: 'Scripture-inspired card with dove and floral border.', imageUrl: '/cards/birthday-religious-1.jpg', price: 5.49, vendor: 'MockCards' },

  // Anniversary cards
  { id: 'card-010', category: 'anniversary', tone: 'Sentimental', title: 'Together Is My Favorite Place', description: 'Romantic illustration of intertwined hands.', imageUrl: '/cards/anniversary-sentimental-1.jpg', price: 6.99, vendor: 'MockCards' },
  { id: 'card-011', category: 'anniversary', tone: 'Sentimental', title: 'Years of Love', description: 'Elegant gold embossed card with timeless design.', imageUrl: '/cards/anniversary-sentimental-2.jpg', price: 7.49, vendor: 'MockCards' },
  { id: 'card-012', category: 'anniversary', tone: 'Funny', title: 'Still Not Sick of You', description: 'Playful card for couples who appreciate humor.', imageUrl: '/cards/anniversary-funny-1.jpg', price: 5.99, vendor: 'MockCards' },

  // Holiday cards
  { id: 'card-020', category: 'holiday', tone: 'Sentimental', title: 'To the World\'s Best Mom', description: 'Soft floral design perfect for Mother\'s Day.', imageUrl: '/cards/holiday-sentimental-1.jpg', price: 5.99, vendor: 'MockCards' },
  { id: 'card-021', category: 'holiday', tone: 'Funny', title: 'Thanks for Not Selling Me', description: 'Hilarious Mother\'s/Father\'s Day card.', imageUrl: '/cards/holiday-funny-1.jpg', price: 5.49, vendor: 'MockCards' },
  { id: 'card-022', category: 'holiday', tone: 'Religious', title: 'God Bless You This Season', description: 'Faith-based holiday greeting with scripture.', imageUrl: '/cards/holiday-religious-1.jpg', price: 5.49, vendor: 'MockCards' },

  // Graduation cards
  { id: 'card-030', category: 'graduation', tone: 'Sentimental', title: 'The World Awaits You', description: 'Inspiring graduation card with mountain vista illustration.', imageUrl: '/cards/graduation-sentimental-1.jpg', price: 6.49, vendor: 'MockCards' },
  { id: 'card-031', category: 'graduation', tone: 'Funny', title: 'Now the Real Learning Begins', description: 'Tongue-in-cheek card about post-graduation life.', imageUrl: '/cards/graduation-funny-1.jpg', price: 5.99, vendor: 'MockCards' },

  // Custom / General
  { id: 'card-040', category: 'custom', tone: 'Sentimental', title: 'Thinking of You', description: 'A beautiful all-purpose card for any occasion.', imageUrl: '/cards/custom-sentimental-1.jpg', price: 4.99, vendor: 'MockCards' },
  { id: 'card-041', category: 'custom', tone: 'Funny', title: 'Just Because You\'re Awesome', description: 'Fun card to brighten anyone\'s day.', imageUrl: '/cards/custom-funny-1.jpg', price: 4.99, vendor: 'MockCards' },
  { id: 'card-042', category: 'custom', tone: 'Edgy/Adult Humor', title: 'You\'re Old. Let\'s Drink.', description: 'Adults-only humor for close friends.', imageUrl: '/cards/custom-edgy-1.jpg', price: 6.49, vendor: 'MockCards' },
];

async function searchCards({ category, tone } = {}) {
  // Simulate API latency
  await new Promise((r) => setTimeout(r, 100));

  let results = [...MOCK_CARDS];

  if (category) {
    results = results.filter((c) => c.category === category.toLowerCase());
  }
  if (tone) {
    results = results.filter((c) => c.tone.toLowerCase() === tone.toLowerCase());
  }

  return results;
}

module.exports = { searchCards, MOCK_CARDS };
