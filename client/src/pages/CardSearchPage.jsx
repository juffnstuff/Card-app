import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Filter, ExternalLink, Check, ShoppingBag, Sparkles } from 'lucide-react';

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

const CARD_COLORS = {
  birthday: 'from-pink-200 to-orange-200',
  anniversary: 'from-rose-200 to-pink-200',
  holiday: 'from-green-200 to-emerald-200',
  graduation: 'from-blue-200 to-indigo-200',
  custom: 'from-purple-200 to-pink-200',
};

function CardImage({ card }) {
  const [imgError, setImgError] = useState(false);

  if (!card.imageUrl || imgError) {
    return (
      <div className={`h-52 bg-gradient-to-br ${CARD_COLORS[card.category] || CARD_COLORS.custom} flex items-center justify-center`}>
        <div className="bg-white/80 rounded-xl p-4 text-center max-w-[80%]">
          <p className="font-serif text-lg font-bold text-charcoal leading-tight">{card.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-52 bg-gradient-to-br ${CARD_COLORS[card.category] || CARD_COLORS.custom} flex items-center justify-center p-3`}>
      <img
        src={card.imageUrl}
        alt={card.title}
        className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}

function CardGrid({ cards, clickedCards, onBuy, highlight }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow ${
            highlight ? 'border-warmth/40 ring-1 ring-warmth/20' : 'border-cream-dark'
          }`}
        >
          <CardImage card={card} />
          <div className="p-4 space-y-3">
            <h3 className="font-serif font-bold text-charcoal leading-tight">{card.title}</h3>
            <p className="text-sm text-charcoal-light">{card.description}</p>
            {card.reason && (
              <div className="flex items-start gap-1.5 bg-warmth/5 rounded-lg p-2">
                <Sparkles size={14} className="text-warmth mt-0.5 flex-shrink-0" />
                <p className="text-xs text-charcoal-light italic">{card.reason}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-charcoal">${card.price.toFixed(2)}</span>
                <span className="text-xs text-charcoal-light px-2 py-0.5 bg-cream rounded-full">{card.tone}</span>
              </div>
              <span className="text-xs text-charcoal-light">{card.vendor}</span>
            </div>
            {clickedCards.has(card.id) ? (
              <div className="flex items-center justify-center gap-2 py-2.5 bg-sage/10 text-sage-dark rounded-xl font-medium">
                <Check size={18} /> Tracked! Finish on Amazon
              </div>
            ) : (
              <button
                onClick={() => onBuy(card)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-colors bg-warmth hover:bg-warmth-dark text-white"
              >
                <ShoppingBag size={16} />
                Buy on Amazon
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CardSearchPage() {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiPowered, setAiPowered] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [tone, setTone] = useState(searchParams.get('tone') || '');
  const [clickedCards, setClickedCards] = useState(new Set());

  const contactId = searchParams.get('contactId');
  const dateId = searchParams.get('dateId');

  // Fetch AI recommendations when coming from a contact's date
  useEffect(() => {
    if (!contactId) return;

    setRecLoading(true);
    api.getRecommendations({
      contactId,
      dateId,
      occasion: category || undefined,
      tone: tone || undefined,
    })
      .then((data) => {
        setRecommendations(data.recommendations || []);
        setAiPowered(data.aiPowered || false);
      })
      .catch((err) => {
        console.error('[Recommendations] Failed:', err.message);
        setRecommendations([]);
        setAiPowered(false);
      })
      .finally(() => setRecLoading(false));
  }, [contactId, dateId]);

  // Browse all cards
  const search = () => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (tone) params.tone = tone;

    api.searchCards(params)
      .then((data) => setCards(data.cards))
      .catch((err) => {
        console.error('[CardSearch] Failed:', err.message);
        setCards([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(search, [category, tone]);

  const handleBuyOnAmazon = async (card) => {
    // Validate URL protocol before opening
    try {
      const url = new URL(card.affiliateUrl);
      if (!['http:', 'https:'].includes(url.protocol)) return;
      window.open(card.affiliateUrl, '_blank', 'noopener');
    } catch {
      return; // Invalid URL
    }

    if (contactId && dateId) {
      try {
        await api.createOrder({
          contactId,
          dateId,
          cardProductId: card.asin || card.id,
          cardTitle: card.title,
          cardImageUrl: card.imageUrl,
          cardPrice: card.price,
          affiliateUrl: card.affiliateUrl,
        });
        setClickedCards((prev) => new Set(prev).add(card.id));
      } catch {
        // Order tracking failed silently — the Amazon tab is already open
      }
    }
  };

  // Filter out recommended cards from the browse grid to avoid duplicates
  const recIds = new Set(recommendations.map((r) => r.id));
  const browseCards = cards.filter((c) => !recIds.has(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-1">Browse Cards</h1>
        <p className="text-charcoal-light text-sm">
          {contactId
            ? "Pick the perfect card — you'll buy it on Amazon and it ships right to you."
            : 'Browse our collection. Select a contact\'s date first to track your purchase.'}
        </p>
      </div>

      {/* AI Recommendations */}
      {contactId && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-warmth" />
            <h2 className="font-serif text-lg font-bold text-charcoal">
              {aiPowered ? 'AI Picks for You' : 'Suggested Cards'}
            </h2>
            {aiPowered && (
              <span className="px-2 py-0.5 bg-warmth/10 text-warmth-dark rounded-full text-xs font-medium">
                Powered by AI
              </span>
            )}
          </div>
          {recLoading ? (
            <div className="text-center py-8 text-charcoal-light">Finding the perfect cards...</div>
          ) : recommendations.length > 0 ? (
            <CardGrid cards={recommendations} clickedCards={clickedCards} onBuy={handleBuyOnAmazon} highlight />
          ) : null}
        </div>
      )}

      {/* Divider when both sections present */}
      {contactId && recommendations.length > 0 && (
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 border-t border-cream-dark" />
          <span className="text-sm text-charcoal-light font-medium">Or browse all cards</span>
          <div className="flex-1 border-t border-cream-dark" />
        </div>
      )}

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
          {browseCards.length} card{browseCards.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="text-center py-16 text-charcoal-light">Loading cards...</div>
      ) : browseCards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-cream-dark p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-charcoal-light">No cards match your filters. Try adjusting your selection.</p>
        </div>
      ) : (
        <CardGrid cards={browseCards} clickedCards={clickedCards} onBuy={handleBuyOnAmazon} />
      )}

      {/* Affiliate disclosure */}
      <p className="text-xs text-charcoal-light/60 text-center pt-4">
        As an Amazon Associate, CardKeeper earns from qualifying purchases.
      </p>
    </div>
  );
}
