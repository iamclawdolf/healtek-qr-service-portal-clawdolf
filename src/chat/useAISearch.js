/**
 * useAISearch React Hook
 *
 * Custom React hook for integrating AI candidate search into components.
 */

import { useState, useCallback, useRef } from 'react';
import { searchCandidates, validateQuery } from './aiService';
import { applyScoresToCandidates, sortByScore } from './candidateScoring';
import { debounce, simpleTextSearch } from './searchUtils';
import { isApiKeyConfigured } from './config';

/**
 * Custom hook for AI-powered candidate search
 *
 * @param {Array} initialCandidates - Initial candidates array
 * @param {object} options - Hook options
 * @param {number} options.debounceMs - Debounce delay in ms (default: 500)
 * @param {boolean} options.autoSearch - Auto-search on query change (default: false)
 * @param {boolean} options.sortResults - Sort results by score (default: true)
 *
 * @returns {object} Hook state and methods
 *
 * @example
 * const {
 *   query,
 *   setQuery,
 *   candidates,
 *   isSearching,
 *   error,
 *   search,
 *   clearSearch,
 *   stats
 * } = useAISearch(initialCandidates);
 */
export function useAISearch(initialCandidates, options = {}) {
  const {
    debounceMs = 500,
    autoSearch = false,
    sortResults = true,
  } = options;

  // State
  const [query, setQueryState] = useState('');
  const [candidates, setCandidates] = useState(initialCandidates);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchResult, setLastSearchResult] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Refs
  const originalCandidates = useRef(initialCandidates);
  const abortControllerRef = useRef(null);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(async (searchQuery) => {
    // Validate query
    const validation = validateQuery(searchQuery);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Cancel any pending search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setError(null);

    try {
      let results;

      // Use AI search if configured, otherwise fall back to simple text search
      if (isApiKeyConfigured()) {
        results = await searchCandidates(searchQuery, originalCandidates.current);
      } else {
        // Fallback to simple text search
        const textResults = simpleTextSearch(searchQuery, originalCandidates.current);
        results = {
          success: true,
          isFallback: true,
          results: textResults.map(c => ({
            candidateId: c.id,
            score: c.simpleScore,
            matchedCriteria: c.matchedWords || [],
            missingCriteria: [],
            explanation: 'Text-based search (AI not configured)',
          })),
        };
      }

      if (results.success) {
        // Apply scores to candidates
        let updatedCandidates = applyScoresToCandidates(
          originalCandidates.current,
          results.results
        );

        // Sort if enabled
        if (sortResults) {
          updatedCandidates = sortByScore(updatedCandidates);
        }

        setCandidates(updatedCandidates);
        setLastSearchResult(results);

        // Add to search history
        setSearchHistory(prev => [
          { query: searchQuery, timestamp: new Date(), resultCount: results.results.length },
          ...prev.slice(0, 9) // Keep last 10 searches
        ]);
      } else {
        setError(results.error || 'Search failed');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred during search');
      }
    } finally {
      setIsSearching(false);
    }
  }, [sortResults]);

  /**
   * Debounced search function
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((q) => performSearch(q), debounceMs),
    [performSearch, debounceMs]
  );

  /**
   * Set query and optionally trigger auto-search
   */
  const setQuery = useCallback((newQuery) => {
    setQueryState(newQuery);
    if (autoSearch && newQuery.length >= 3) {
      debouncedSearch(newQuery);
    }
  }, [autoSearch, debouncedSearch]);

  /**
   * Manually trigger search
   */
  const search = useCallback((customQuery = null) => {
    const searchQuery = typeof customQuery === 'string' ? customQuery : query;
    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
      performSearch(searchQuery.trim());
    } else {
      setError('Please enter a search query');
    }
  }, [query, performSearch]);

  /**
   * Clear search and reset to original candidates
   */
  const clearSearch = useCallback(() => {
    setQueryState('');
    setCandidates(originalCandidates.current);
    setLastSearchResult(null);
    setError(null);
  }, []);

  /**
   * Update original candidates (e.g., when data changes)
   */
  const updateCandidates = useCallback((newCandidates) => {
    originalCandidates.current = newCandidates;
    if (!lastSearchResult) {
      setCandidates(newCandidates);
    }
  }, [lastSearchResult]);

  /**
   * Get search statistics
   */
  const getStats = useCallback(() => {
    if (!lastSearchResult || !lastSearchResult.results) {
      return null;
    }

    const scores = lastSearchResult.results.map(r => r.score);
    return {
      totalCandidates: candidates.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      topScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      searchCriteria: lastSearchResult.searchCriteria || [],
      isMock: lastSearchResult.isMock || false,
      isFallback: lastSearchResult.isFallback || false,
    };
  }, [candidates.length, lastSearchResult]);

  return {
    // State
    query,
    candidates,
    isSearching,
    error,
    lastSearchResult,
    searchHistory,

    // Actions
    setQuery,
    search,
    clearSearch,
    updateCandidates,

    // Computed
    stats: getStats(),
    isAIConfigured: isApiKeyConfigured(),
    hasSearched: lastSearchResult !== null,
  };
}

export default useAISearch;
