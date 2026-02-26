/**
 * AI Candidate Search Module
 *
 * Main entry point for all AI search functionality.
 * Import from this file to access all chat/search features.
 *
 * @example
 * import { useAISearch, setApiKey, searchCandidates } from './chat';
 */

// Configuration
export {
  default as config,
  setApiKey,
  getApiKey,
  isApiKeyConfigured,
  updateConfig,
  getConfig,
  setProvider,
} from './config';

// AI Service
export {
  searchCandidates,
  validateQuery,
  getSystemPrompt,
} from './aiService';

// Candidate Scoring
export {
  TOTAL_BARS,
  scoreToMatchBars,
  matchBarsToScore,
  getScoreCategory,
  getScoreColorClass,
  applyScoresToCandidates,
  sortByScore,
  filterByMinScore,
  getSearchStats,
} from './candidateScoring';

// Search Utilities
export {
  CRITERIA_KEYWORDS,
  extractCriteria,
  extractYearsOfExperience,
  cleanQuery,
  extractPosition,
  getSuggestions,
  buildSearchParams,
  debounce,
  simpleTextSearch,
} from './searchUtils';

// React Hook
export { useAISearch } from './useAISearch';

// Data services
export { fetchRealCandidates } from './realDataService';
export { mapRealResults } from './realDataMapper';

/**
 * Quick setup function for getting started
 *
 * @param {string} apiKey - Your AI provider API key
 * @param {string} provider - 'openai' or 'anthropic' (default: 'openai')
 *
 * @example
 * import { quickSetup } from './chat';
 * quickSetup('sk-your-api-key', 'openai');
 */
export function quickSetup(apiKey, provider = 'openai') {
  const { setApiKey, setProvider } = require('./config');
  setApiKey(apiKey);
  setProvider(provider);
  console.log(`AI Search configured with ${provider} provider`);
}
