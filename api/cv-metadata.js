const DEFAULT_TARGET = process.env.REAL_SEARCH_TARGET;
const DEFAULT_SESSION = process.env.REAL_SEARCH_SESSION
    || 'test-session';

/**
 * Serverless proxy for fetching CV metadata from the Atollon service.
 * Allows the frontend to call `/api/cv-metadata?cvId=...` without CORS headaches.
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cvId } = req.query;
    if (!cvId) {
        return res.status(400).json({ error: 'cvId is required' });
    }

    const targetUrl = `${DEFAULT_TARGET}/svc/cvsearch/cv/${cvId}/metadata`;

    try {
        const upstream = await fetch(targetUrl, {
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
        console.error('CV metadata proxy failed:', error);
        return res.status(502).json({ error: 'Failed to reach CV metadata service' });
    }
}
