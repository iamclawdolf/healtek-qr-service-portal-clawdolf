/**
 * Candidate Scoring Module
 *
 * This module converts AI scores to visual representations (match bars)
 * and provides utilities for score manipulation.
 */

/**
 * Number of bars to display in the match visualization
 */
export const TOTAL_BARS = 8;

/**
 * Convert a percentage score (0-100) to match bars array
 *
 * @param {number} score - Score from 0 to 100
 * @returns {boolean[]} Array of booleans representing filled/empty bars
 *
 * @example
 * scoreToMatchBars(50) // returns [true, true, true, true, false, false, false, false]
 * scoreToMatchBars(100) // returns [true, true, true, true, true, true, true, true]
 */
export function scoreToMatchBars(score) {
  // Ensure score is within bounds
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Calculate how many bars should be filled
  const filledBars = Math.round((normalizedScore / 100) * TOTAL_BARS);

  // Create array of booleans
  return Array(TOTAL_BARS).fill(false).map((_, index) => index < filledBars);
}

/**
 * Convert match bars array back to percentage
 *
 * @param {boolean[]} matchBars - Array of booleans
 * @returns {number} Percentage score
 */
export function matchBarsToScore(matchBars) {
  const filledCount = matchBars.filter(Boolean).length;
  return Math.round((filledCount / TOTAL_BARS) * 100);
}

/**
 * Get score category label
 *
 * @param {number} score - Score from 0 to 100
 * @returns {string} Human-readable category
 */
export function getScoreCategory(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'Weak';
  return 'Poor';
}

/**
 * Get color class based on score
 *
 * @param {number} score - Score from 0 to 100
 * @returns {string} CSS color class name
 */
export function getScoreColorClass(score) {
  if (score >= 90) return 'score-excellent';
  if (score >= 70) return 'score-good';
  if (score >= 50) return 'score-moderate';
  if (score >= 30) return 'score-weak';
  return 'score-poor';
}

/**
 * Apply AI search results to candidates array
 * Updates the matchBars property based on AI scores
 *
 * @param {Array} candidates - Original candidates array
 * @param {Array} aiResults - Results from AI search with scores
 * @returns {Array} Updated candidates with new matchBars
 *
 * @example
 * const updatedCandidates = applyScoresToCandidates(candidates, aiSearchResults.results);
 */
export function applyScoresToCandidates(candidates, aiResults) {
  // Create a map of candidateId to score for quick lookup
  const scoreMap = new Map(
    aiResults.map(r => [r.candidateId, r])
  );

  return candidates.map(candidate => {
    const result = scoreMap.get(candidate.id);

    if (result) {
      return {
        ...candidate,
        matchBars: scoreToMatchBars(result.score),
        aiScore: result.score,
        aiExplanation: result.explanation,
        matchedCriteria: result.matchedCriteria,
        missingCriteria: result.missingCriteria,
      };
    }

    // No AI result for this candidate, keep original
    return candidate;
  });
}

/**
 * Sort candidates by their AI score (descending)
 *
 * @param {Array} candidates - Candidates with aiScore property
 * @returns {Array} Sorted candidates
 */
export function sortByScore(candidates) {
  return [...candidates].sort((a, b) => {
    const scoreA = a.aiScore ?? matchBarsToScore(a.matchBars);
    const scoreB = b.aiScore ?? matchBarsToScore(b.matchBars);
    return scoreB - scoreA;
  });
}

/**
 * Filter candidates by minimum score threshold
 *
 * @param {Array} candidates - Candidates with scores
 * @param {number} minScore - Minimum score threshold (0-100)
 * @returns {Array} Filtered candidates
 */
export function filterByMinScore(candidates, minScore) {
  return candidates.filter(c => {
    const score = c.aiScore ?? matchBarsToScore(c.matchBars);
    return score >= minScore;
  });
}

/**
 * Get statistics about search results
 *
 * @param {Array} candidates - Candidates with scores
 * @returns {object} Statistics object
 */
export function getSearchStats(candidates) {
  const scores = candidates.map(c =>
    c.aiScore ?? matchBarsToScore(c.matchBars)
  );

  return {
    total: candidates.length,
    excellent: scores.filter(s => s >= 90).length,
    good: scores.filter(s => s >= 70 && s < 90).length,
    moderate: scores.filter(s => s >= 50 && s < 70).length,
    weak: scores.filter(s => s >= 30 && s < 50).length,
    poor: scores.filter(s => s < 30).length,
    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  };
}

const candidateScoring = {
  TOTAL_BARS,
  scoreToMatchBars,
  matchBarsToScore,
  getScoreCategory,
  getScoreColorClass,
  applyScoresToCandidates,
  sortByScore,
  filterByMinScore,
  getSearchStats,
};

export default candidateScoring;
