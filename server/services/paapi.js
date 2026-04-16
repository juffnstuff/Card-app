// Amazon Product Advertising API 5.0 service
// Fetches product images, prices, and details for greeting cards using
// the official API instead of scraping product pages.

const amazonPaapi = require('amazon-paapi');

// PA-API credentials from environment
const ACCESS_KEY = process.env.AMAZON_ACCESS_KEY;
const SECRET_KEY = process.env.AMAZON_SECRET_KEY;
const PARTNER_TAG = process.env.AMAZON_AFFILIATE_TAG || process.env.AMAZON_PARTNER_TAG;
const PA_HOST = process.env.AMAZON_PA_API_HOST || 'webservices.amazon.com';
const PA_REGION = process.env.AMAZON_PA_API_REGION || 'us-east-1';

// In-memory cache: asin -> { data, fetchedAt }
const productCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500;

function isConfigured() {
  return !!(ACCESS_KEY && SECRET_KEY && PARTNER_TAG);
}

// Evict oldest entry if cache is full
function cacheSet(key, data) {
  if (productCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = productCache.keys().next().value;
    productCache.delete(oldestKey);
  }
  productCache.set(key, { data, fetchedAt: Date.now() });
}

function cacheGet(key) {
  const entry = productCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_TTL) {
    productCache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Fetch product details for up to 10 ASINs at once.
 * Returns a map of asin -> { title, imageUrl, price, priceValue, availability, detailUrl }
 */
async function getItemsByAsins(asins) {
  if (!isConfigured()) return {};

  // Deduplicate and filter to uncached
  const unique = [...new Set(asins)];
  const results = {};
  const uncached = [];

  for (const asin of unique) {
    const cached = cacheGet(asin);
    if (cached) {
      results[asin] = cached;
    } else {
      uncached.push(asin);
    }
  }

  if (uncached.length === 0) return results;

  // PA-API allows max 10 items per request
  const batches = [];
  for (let i = 0; i < uncached.length; i += 10) {
    batches.push(uncached.slice(i, i + 10));
  }

  for (const batch of batches) {
    try {
      const commonParams = {
        AccessKey: ACCESS_KEY,
        SecretKey: SECRET_KEY,
        PartnerTag: PARTNER_TAG,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
        Host: PA_HOST,
        Region: PA_REGION,
      };

      const requestParams = {
        ItemIds: batch,
        ItemIdType: 'ASIN',
        Resources: [
          'Images.Primary.Large',
          'Images.Primary.Medium',
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message',
        ],
      };

      const response = await amazonPaapi.GetItems(commonParams, requestParams);

      if (response.ItemsResult?.Items) {
        for (const item of response.ItemsResult.Items) {
          const data = {
            title: item.ItemInfo?.Title?.DisplayValue || null,
            imageUrl: item.Images?.Primary?.Large?.URL
              || item.Images?.Primary?.Medium?.URL
              || null,
            price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || null,
            priceValue: item.Offers?.Listings?.[0]?.Price?.Amount || null,
            availability: item.Offers?.Listings?.[0]?.Availability?.Message || null,
            detailUrl: item.DetailPageURL || null,
          };
          cacheSet(item.ASIN, data);
          results[item.ASIN] = data;
        }
      }

      // Items not returned by the API (invalid ASIN, unavailable, etc.)
      for (const asin of batch) {
        if (!results[asin]) {
          const empty = { title: null, imageUrl: null, price: null, priceValue: null, availability: null, detailUrl: null };
          cacheSet(asin, empty);
          results[asin] = empty;
        }
      }
    } catch (err) {
      console.error('[PA-API] GetItems failed for batch:', batch, err.message);
      // Don't cache errors — let retries work
    }
  }

  return results;
}

/**
 * Fetch a single product's image URL.
 * Returns the image URL string or null.
 */
async function getProductImage(asin) {
  const items = await getItemsByAsins([asin]);
  return items[asin]?.imageUrl || null;
}

module.exports = { isConfigured, getItemsByAsins, getProductImage };
