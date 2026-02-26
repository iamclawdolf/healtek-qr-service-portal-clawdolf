const DEFAULT_ENDPOINT = process.env.REACT_APP_REAL_SEARCH_URL
  || '/api/real-search';

const METADATA_ENDPOINT = '/api/cv-metadata';

const DEFAULT_SESSION = process.env.REACT_APP_REAL_SEARCH_SESSION || 'test-session';

/**
 * Fetch real candidate data from the Atollon CV search service.
 *
 * @param {string} query - Search query to send to the service.
 * @param {number} limit - Maximum number of candidates to retrieve.
 * @returns {Promise<object>} Raw API response.
 */
export async function fetchRealCandidates(query, limit = 50) {
  if (!query || !query.trim()) {
    throw new Error('Please enter a search query');
  }

  const searchParams = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const response = await fetch(`${DEFAULT_ENDPOINT}?${searchParams.toString()}`, {
    headers: {
      'X-Atollon-Session': (typeof window !== 'undefined' && window.ATOLLON_SESSION) || DEFAULT_SESSION,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      message || `Real search request failed with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch CV metadata including AI-extracted data.
 *
 * @param {number|string} cvId - The CV ID to fetch metadata for.
 * @returns {Promise<object|null>} Metadata object or null if not found.
 */
export async function fetchCvMetadata(cvId) {
  try {
    const response = await fetch(`${METADATA_ENDPOINT}?cvId=${cvId}`, {
      headers: {
        'X-Atollon-Session': (typeof window !== 'undefined' && window.ATOLLON_SESSION) || DEFAULT_SESSION,
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch metadata for CV ${cvId}: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn(`Error fetching metadata for CV ${cvId}:`, error);
    return null;
  }
}

export default fetchRealCandidates;

