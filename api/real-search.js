const DEFAULT_TARGET = process.env.REAL_SEARCH_TARGET;
const DEFAULT_SESSION = process.env.REAL_SEARCH_SESSION
  || 'test-session';

/**
 * Serverless proxy for the Atollon CV search service.
 * Allows the frontend to call `/api/real-search?q=...` without CORS headaches.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const targetUrl = new URL('/svc/cvsearch/search', DEFAULT_TARGET);

  // copy query params
  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => targetUrl.searchParams.append(key, v));
    } else if (value !== undefined) {
      targetUrl.searchParams.append(key, value);
    }
  });

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        'X-Atollon-Session': req.headers['x-atollon-session'] || DEFAULT_SESSION,
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return res.status(upstream.status).send(text || 'Upstream request failed');
    }

    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(200).send(text);
  } catch (error) {
    console.error('Real search proxy failed:', error);
    return res.status(502).json({ error: 'Failed to reach CV search service' });
  }
}

