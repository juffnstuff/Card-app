import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Search, Filter, ShoppingBag, Check } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'custom', label: 'General / Custom' },
];

const TONES = [
  { value: '', label: 'All Tones' },
  { value: 'Funny', label: 'Funny' },
  { value: 'Sentimental', label: 'Sentimental' },
  { value: 'Religious', label: 'Religious' },
  { value: 'Kids', label: 'Kids' },
  { value: 'Edgy/Adult Humor', label: 'Edgy / Adult' },
];

// DECISION: Card images are placeholder colored boxes since we're using a mock catalog.
// In production, these would be real product images from the vendor API.
const CARD_COLORS = {
  birthday: 'from-pink-200 to-orange-200',
  anniversary: 'from-rose-200 to-pink-200',
  holiday: 'from-green-200 to-emerald-200',
  graduation: 'from-blue-200 to-indigo-200',
  custom: 'from-purple-200 to-pink-200',
};

export default function CardSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [tone, setTone] = useState(searchParams.get('tone') || '');
  const [ordering, setOrdering] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const contactId = searchParams.get('contactId');
  const dateId = searchParams.get('dateId');

  const search = () => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (tone) params.tone = tone;

    api.searchCards(params)
      .then((data) => setCards(data.cards))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  };

  useEffect(search, [category, tone]);

  const handleOrder = async (card) => {
    if (!contactId || !dateId) {
      alert('To order a card, start from an upcoming date on your dashboard or a contact\'s detail page.');
      return;
    }

    setOrdering(card.id);
    try {
      await api.createOrder({
        contactId,
        dateId,
        cardProductId: card.id,
        cardTitle: card.title,
        cardImageUrl: card.imageUrl,
        cardPrice: card.price,
      });
      setOrderSuccess(card.id);
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Browse Cards</h1>
        <p className="text-charcoal-light text-sm">
          {contactId
            ? 'Pick the perfect card — we\'ll ship it to your door so you can handwrite it.'
            : 'Browse our collection. Select a contact\'s date first to place an order.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-charcoal-light" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-cream-dark rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warmth/30"
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="px-3 py-2 border border-cream-dark rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-warmth/30"
        >
          {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <span className="text-sm text-charcoal-light ml-auto">
          {cards.length} card{cards.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="text-center py-16 text-charcoal-light">Loading cards...</div>
      ) : cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-charcoal-light">No cards match your filters. Try adjusting your selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-cream-dark overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Placeholder card image */}
              <div className={`h-48 bg-gradient-to-br ${CARD_COLORS[card.category] || CARD_COLORS.custom} flex items-center justify-center`}>
                <div className="bg-white/80 rounded-xl p-4 text-center max-w-[80%]">
                  <p className="font-serif text-lg font-bold text-charcoal leading-tight">{card.title}</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-sm text-charcoal-light">{card.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-charcoal">${card.price.toFixed(2)}</span>
                    <span className="text-xs text-charcoal-light px-2 py-0.5 bg-cream rounded-full">{card.tone}</span>
                  </div>
                </div>

                {orderSuccess === card.id ? (
                  <div className="flex items-center justify-center gap-2 py-2.5 bg-sage/10 text-sage-dark rounded-xl font-medium">
                    <Check size={18} /> Ordered!
                  </div>
                ) : (
                  <button
                    onClick={() => handleOrder(card)}
                    disabled={ordering === card.id || !contactId}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors ${
                      contactId
                        ? 'bg-warmth hover:bg-warmth-dark text-white'
                        : 'bg-cream text-charcoal-light cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    <ShoppingBag size={16} />
                    {ordering === card.id ? 'Ordering...' : contactId ? 'Order This Card' : 'Select a date first'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
