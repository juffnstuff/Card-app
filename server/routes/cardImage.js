const express = require('express');
const https = require('https');
const http = require('http');

const router = express.Router();

// In-memory cache: asin -> { url, fetchedAt }
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// GET /api/card-image/:asin — proxy Amazon product image
router.get('/:asin', async (req, res) => {
  const { asin } = req.params;
  if (!/^B[0-9A-Z]{9}$/.test(asin)) {
    return res.status(400).json({ error: 'Invalid ASIN' });
  }

  // Check cache
  const cached = imageCache.get(asin);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    if (cached.imageData) {
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      return res.send(cached.imageData);
    }
    // Cached as "no image found"
    return res.status(404).json({ error: 'No image available' });
  }

  try {
    // Fetch the Amazon product page to find the OG image
    const html = await fetchPage(`https://www.amazon.com/dp/${asin}`);
    const imageUrl = extractImageUrl(html);

    if (!imageUrl) {
      imageCache.set(asin, { imageData: null, fetchedAt: Date.now() });
      return res.status(404).json({ error: 'No image available' });
    }

    // Fetch the actual image
    const imageData = await fetchBinary(imageUrl);
    imageCache.set(asin, { imageData, fetchedAt: Date.now() });

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageData);
  } catch (err) {
    console.error(`[Card Image] Failed to fetch image for ${asin}:`, err.message);
    // Don't cache errors — let it retry
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    }, (resp) => {
      // Follow redirects
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        return fetchPage(resp.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      resp.on('data', (chunk) => data += chunk);
      resp.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get;
    get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 10000,
    }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        return fetchBinary(resp.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      resp.on('data', (chunk) => chunks.push(chunk));
      resp.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function extractImageUrl(html) {
  // Try og:image meta tag first
  let match = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i);
  if (!match) match = html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);
  if (match) return match[1];

  // Try the main product image (landingImage)
  match = html.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (match) return match[1];

  // Try any large product image
  match = html.match(/"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
  if (match) return match[1];

  // Last resort — any m.media-amazon image
  match = html.match(/(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+_.-]+\._[^"']+_\.jpg)/);
  if (match) return match[1];

  return null;
}

module.exports = router;
