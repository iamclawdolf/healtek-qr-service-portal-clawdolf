/**
 * AI Service Module
 *
 * This module handles communication with AI APIs for candidate search.
 * Developers need to implement the actual API calls based on their chosen provider.
 */

import config, { isApiKeyConfigured, getConfig } from './config';

/**
 * System prompt for candidate matching AI
 * This instructs the AI on how to evaluate candidates
 */
const CANDIDATE_MATCHING_PROMPT = `You are an expert HR assistant that evaluates job candidates based on search criteria.

Given a search query describing ideal candidate requirements and a list of candidates with their profiles, you must:
1. Analyze each candidate against the search criteria
2. Score each candidate from 0 to 100 based on how well they match
3. Provide a brief explanation for each score

Return your response as a JSON object with this structure:
{
  "results": [
    {
      "candidateId": 1,
      "score": 85,
      "matchedCriteria": ["criteria1", "criteria2"],
      "missingCriteria": ["criteria3"],
      "explanation": "Brief explanation of the score"
    }
  ],
  "searchCriteria": ["extracted", "criteria", "from", "query"]
}

Be fair and objective. Consider partial matches. A score of:
- 90-100: Excellent match, meets almost all criteria
- 70-89: Good match, meets most criteria
- 50-69: Moderate match, meets some criteria
- 30-49: Weak match, meets few criteria
- 0-29: Poor match, meets very few or no criteria`;

/**
 * Format candidates data for AI prompt
 * @param {Array} candidates - Array of candidate objects
 * @returns {string} Formatted string of candidates
 */
function formatCandidatesForPrompt(candidates) {
  return candidates.map(c => `
Candidate ID: ${c.id}
Name: ${c.name}
Status: ${c.status}
Summary: ${c.summary.intro} ${c.summary.body} ${c.summary.detail}
Skills/Certifications: ${c.summary.listItems.join(', ')}
`).join('\n---\n');
}

/**
 * Call OpenAI API
 * @param {string} userMessage - The user's search query
 * @param {string} candidatesContext - Formatted candidates data
 * @returns {Promise<object>} AI response
 */
async function callOpenAI(userMessage, candidatesContext) {
  const conf = getConfig();

  const response = await fetch(conf.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${conf.apiKey}`,
    },
    body: JSON.stringify({
      model: conf.model,
      messages: [
        { role: 'system', content: CANDIDATE_MATCHING_PROMPT },
        { role: 'user', content: `Search Query: "${userMessage}"\n\nCandidates:\n${candidatesContext}` }
      ],
      temperature: conf.temperature,
      max_tokens: conf.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Call Anthropic API
 * @param {string} userMessage - The user's search query
 * @param {string} candidatesContext - Formatted candidates data
 * @returns {Promise<object>} AI response
 */
async function callAnthropic(userMessage, candidatesContext) {
  const conf = getConfig();

  const response = await fetch(conf.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': conf.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: conf.model || 'claude-3-sonnet-20240229',
      max_tokens: conf.maxTokens,
      system: CANDIDATE_MATCHING_PROMPT,
      messages: [
        { role: 'user', content: `Search Query: "${userMessage}"\n\nCandidates:\n${candidatesContext}` }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.content[0].text);
}

/**
 * Call Google Gemini API
 * @param {string} userMessage - The user's search query
 * @param {string} candidatesContext - Formatted candidates data
 * @returns {Promise<object>} AI response
 */
async function callGemini(userMessage, candidatesContext) {
  const conf = getConfig();

  const fullPrompt = `${CANDIDATE_MATCHING_PROMPT}

Search Query: "${userMessage}"

Candidates:
${candidatesContext}

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks, no extra text.`;

  const response = await fetch(`${conf.apiEndpoint}?key=${conf.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: fullPrompt }
          ]
        }
      ],
      generationConfig: {
        temperature: conf.temperature,
        maxOutputTokens: conf.maxTokens,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response text from Gemini');
  }

  // Clean up response - remove markdown code blocks if present
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  return JSON.parse(cleanedText);
}

/**
 * Main function to search candidates using AI
 *
 * @param {string} query - The search query describing ideal candidate
 * @param {Array} candidates - Array of candidate objects to evaluate
 * @returns {Promise<object>} Search results with scores
 *
 * @example
 * const results = await searchCandidates(
 *   "Find accountants with 5+ years experience who speak English",
 *   candidatesArray
 * );
 */
export async function searchCandidates(query, candidates) {
  // Check if AI is enabled and configured
  if (!config.enabled) {
    console.warn('AI search is disabled. Enable it in config.');
    return getMockResults(candidates);
  }

  if (!isApiKeyConfigured()) {
    console.warn('AI API key not configured. Using mock results.');
    return getMockResults(candidates);
  }

  try {
    const candidatesContext = formatCandidatesForPrompt(candidates);
    const conf = getConfig();

    let result;
    switch (conf.provider) {
      case 'openai':
        result = await callOpenAI(query, candidatesContext);
        break;
      case 'anthropic':
        result = await callAnthropic(query, candidatesContext);
        break;
      case 'gemini':
        result = await callGemini(query, candidatesContext);
        break;
      default:
        // For custom providers, developers should implement their own handler
        throw new Error(`Provider "${conf.provider}" not implemented. Please implement custom handler.`);
    }

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('AI search failed:', error);

    if (config.fallbackToMock) {
      console.warn('Falling back to mock results');
      return getMockResults(candidates);
    }

    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Generate mock results for development/testing
 * Developers can modify this to create realistic test data
 *
 * @param {Array} candidates - Array of candidates
 * @returns {object} Mock search results
 */
function getMockResults(candidates) {
  // Generate pseudo-random but consistent scores based on candidate data
  const results = candidates.map(c => {
    // Simple scoring based on profile completeness and content length
    const baseScore = Math.min(100, Math.max(20,
      (c.summary.body.length / 5) +
      (c.summary.listItems.length * 10) +
      Math.random() * 20
    ));

    return {
      candidateId: c.id,
      score: Math.round(baseScore),
      matchedCriteria: c.summary.listItems.slice(0, 2),
      missingCriteria: ['Some criteria'],
      explanation: `Mock score based on profile completeness. Replace with real AI evaluation.`,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return {
    success: true,
    isMock: true,
    results,
    searchCriteria: ['mock', 'criteria'],
  };
}

/**
 * Validate search query before sending to AI
 * @param {string} query - The search query
 * @returns {object} Validation result
 */
export function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' };
  }

  if (query.length < 3) {
    return { valid: false, error: 'Query too short. Please be more specific.' };
  }

  if (query.length > 1000) {
    return { valid: false, error: 'Query too long. Please be more concise.' };
  }

  return { valid: true };
}

/**
 * Get the system prompt (useful for debugging)
 * @returns {string} The system prompt used for AI
 */
export function getSystemPrompt() {
  return CANDIDATE_MATCHING_PROMPT;
}

const aiService = {
  searchCandidates,
  validateQuery,
  getSystemPrompt,
};

export default aiService;
