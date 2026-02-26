/**
 * AI Configuration Module
 *
 * This module manages API keys and configuration for AI services.
 * Developers should set their API key here or via environment variables.
 */

// Configuration object for AI services
const config = {
  // API Key - Set this to your AI provider's API key
  // Option 1: Set directly here (not recommended for production)
  // Option 2: Use environment variable REACT_APP_AI_API_KEY
  apiKey: process.env.REACT_APP_AI_API_KEY || '',

  // AI Provider settings
  provider: process.env.REACT_APP_AI_PROVIDER || 'openai', // 'openai', 'anthropic', 'custom'

  // API Endpoint - customize if using a proxy or different provider
  apiEndpoint: process.env.REACT_APP_AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions',

  // Model to use for candidate matching
  model: process.env.REACT_APP_AI_MODEL || 'gpt-4',

  // Temperature for AI responses (0-1, lower = more deterministic)
  temperature: 0.3,

  // Maximum tokens for AI response
  maxTokens: 1000,

  // Timeout for API requests (in milliseconds)
  timeout: 30000,

  // Enable/disable AI features (useful for development without API key)
  enabled: true,

  // Fallback to mock data if API fails
  fallbackToMock: true,
};

/**
 * Set the API key programmatically
 * @param {string} key - The API key to set
 */
export function setApiKey(key) {
  config.apiKey = key;
}

/**
 * Get the current API key
 * @returns {string} The current API key
 */
export function getApiKey() {
  return config.apiKey;
}

/**
 * Check if the API key is configured
 * @returns {boolean} True if API key is set
 */
export function isApiKeyConfigured() {
  return config.apiKey && config.apiKey.length > 0;
}

/**
 * Update configuration settings
 * @param {object} newConfig - Partial config object to merge
 */
export function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}

/**
 * Get the full configuration object
 * @returns {object} The current configuration
 */
export function getConfig() {
  return { ...config };
}

/**
 * Set the AI provider
 * @param {string} provider - 'openai', 'anthropic', 'gemini', or 'custom'
 * @param {string} endpoint - Optional custom endpoint URL
 */
export function setProvider(provider, endpoint = null) {
  config.provider = provider;

  if (endpoint) {
    config.apiEndpoint = endpoint;
  } else {
    // Set default endpoints based on provider
    switch (provider) {
      case 'openai':
        config.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        break;
      case 'anthropic':
        config.apiEndpoint = 'https://api.anthropic.com/v1/messages';
        break;
      case 'gemini':
        config.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        break;
      default:
        // Keep existing endpoint for custom providers
        break;
    }
  }
}

export default config;
