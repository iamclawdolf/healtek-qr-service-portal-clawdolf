/**
 * Search Utilities Module
 *
 * Helper functions for parsing and processing search queries.
 */

/**
 * Common search criteria keywords for candidate matching
 */
export const CRITERIA_KEYWORDS = {
  education: ['degree', 'university', 'college', 'graduation', 'bachelor', 'master', 'phd', 'mba', 'certified', 'certification'],
  experience: ['years', 'experience', 'senior', 'junior', 'mid-level', 'expert', 'professional'],
  languages: ['english', 'french', 'german', 'spanish', 'czech', 'bilingual', 'multilingual', 'fluent'],
  skills: ['accounting', 'finance', 'tax', 'audit', 'bookkeeping', 'excel', 'sap', 'erp', 'ifrs', 'gaap'],
  availability: ['available', 'immediate', 'part-time', 'full-time', 'remote', 'hybrid', 'on-site'],
};

/**
 * Extract potential criteria from a search query
 *
 * @param {string} query - The search query string
 * @returns {object} Extracted criteria by category
 *
 * @example
 * extractCriteria("Find accountants with 5 years experience who speak English")
 * // Returns: { experience: ['5 years experience'], languages: ['english'], skills: ['accountants'] }
 */
export function extractCriteria(query) {
  const normalizedQuery = query.toLowerCase();
  const results = {};

  for (const [category, keywords] of Object.entries(CRITERIA_KEYWORDS)) {
    const found = keywords.filter(keyword =>
      normalizedQuery.includes(keyword.toLowerCase())
    );
    if (found.length > 0) {
      results[category] = found;
    }
  }

  return results;
}

/**
 * Extract years of experience from query
 *
 * @param {string} query - The search query
 * @returns {number|null} Years mentioned, or null if not found
 */
export function extractYearsOfExperience(query) {
  // Match patterns like "5 years", "5+ years", "at least 5 years"
  const patterns = [
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)?/i,
    /at\s+least\s+(\d+)\s*years?/i,
    /minimum\s+(\d+)\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

/**
 * Clean and normalize a search query
 *
 * @param {string} query - Raw search query
 * @returns {string} Cleaned query
 */
export function cleanQuery(query) {
  return query
    .trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[^\w\s\-.,+]/g, '')  // Remove special characters except common ones
    .toLowerCase();
}

/**
 * Check if query is asking for specific position/role
 *
 * @param {string} query - The search query
 * @returns {string|null} Position if found
 */
export function extractPosition(query) {
  const positions = [
    'accountant', 'controller', 'cfo', 'bookkeeper', 'auditor',
    'financial analyst', 'tax specialist', 'payroll specialist',
    'accounts payable', 'accounts receivable', 'finance manager'
  ];

  const normalizedQuery = query.toLowerCase();

  for (const position of positions) {
    if (normalizedQuery.includes(position)) {
      return position;
    }
  }

  return null;
}

/**
 * Generate search suggestions based on partial query
 *
 * @param {string} partialQuery - Partial search query
 * @returns {string[]} Array of suggestions
 */
export function getSuggestions(partialQuery) {
  const suggestions = [
    'Find candidates with college graduation',
    'Accountants with 5+ years experience',
    'Bilingual candidates speaking English and French',
    'Senior accountants with CPA certification',
    'Entry-level positions in accounting',
    'Candidates available for immediate start',
    'Remote-friendly finance professionals',
  ];

  if (!partialQuery || partialQuery.length < 2) {
    return suggestions.slice(0, 3);
  }

  const normalized = partialQuery.toLowerCase();
  return suggestions.filter(s =>
    s.toLowerCase().includes(normalized)
  ).slice(0, 5);
}

/**
 * Build a structured search object from natural language query
 *
 * @param {string} query - Natural language search query
 * @returns {object} Structured search parameters
 */
export function buildSearchParams(query) {
  return {
    rawQuery: query,
    cleanedQuery: cleanQuery(query),
    criteria: extractCriteria(query),
    yearsExperience: extractYearsOfExperience(query),
    position: extractPosition(query),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Debounce function for search input
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Simple text-based search (fallback when AI is not available)
 *
 * @param {string} query - Search query
 * @param {Array} candidates - Candidates to search
 * @returns {Array} Matched candidates with basic scores
 */
export function simpleTextSearch(query, candidates) {
  const queryWords = cleanQuery(query).split(' ').filter(w => w.length > 2);

  return candidates.map(candidate => {
    // Create searchable text from candidate data
    const searchableText = [
      candidate.name,
      candidate.summary.intro,
      candidate.summary.body,
      candidate.summary.detail,
      ...candidate.summary.listItems,
    ].join(' ').toLowerCase();

    // Count matching words
    const matchCount = queryWords.filter(word =>
      searchableText.includes(word)
    ).length;

    // Calculate simple score
    const score = queryWords.length > 0
      ? Math.round((matchCount / queryWords.length) * 100)
      : 50;

    return {
      ...candidate,
      simpleScore: score,
      matchedWords: queryWords.filter(word => searchableText.includes(word)),
    };
  }).sort((a, b) => b.simpleScore - a.simpleScore);
}

const searchUtils = {
  CRITERIA_KEYWORDS,
  extractCriteria,
  extractYearsOfExperience,
  cleanQuery,
  extractPosition,
  getSuggestions,
  buildSearchParams,
  debounce,
  simpleTextSearch,
};

export default searchUtils;
