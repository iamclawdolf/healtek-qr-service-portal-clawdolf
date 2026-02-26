# AI Candidate Search Module

This module provides AI-powered candidate search functionality for the CRM application. It evaluates candidates against search criteria and provides match scores displayed as progress bars.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [API Key Setup](#api-key-setup)
4. [File Structure](#file-structure)
5. [Usage Examples](#usage-examples)
6. [Customization](#customization)
7. [API Reference](#api-reference)

---

## Quick Start

### 1. Set up your API key

**Option A: Environment Variable (Recommended for production)**

Create a `.env` file in the project root:

```env
REACT_APP_AI_API_KEY=your-api-key-here
REACT_APP_AI_PROVIDER=openai
REACT_APP_AI_MODEL=gpt-4
```

**Option B: Programmatic Setup**

```javascript
import { setApiKey, setProvider } from './chat';

// Set API key
setApiKey('your-api-key-here');

// Optionally set provider (default is 'openai')
setProvider('openai'); // or 'anthropic'
```

**Option C: Quick Setup Function**

```javascript
import { quickSetup } from './chat';

quickSetup('your-api-key-here', 'openai');
```

### 2. Use the search hook in your component

```javascript
import { useAISearch } from './chat';

function MyComponent({ candidates }) {
  const {
    query,
    setQuery,
    candidates: searchResults,
    isSearching,
    search,
    clearSearch,
  } = useAISearch(candidates);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search candidates..."
      />
      <button onClick={search} disabled={isSearching}>
        {isSearching ? 'Searching...' : 'Search'}
      </button>
      <button onClick={clearSearch}>Clear</button>

      {searchResults.map(candidate => (
        <div key={candidate.id}>
          {candidate.name} - Score: {candidate.aiScore || 'N/A'}
        </div>
      ))}
    </div>
  );
}
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_AI_API_KEY` | Your AI provider API key | `''` (empty) |
| `REACT_APP_AI_PROVIDER` | AI provider ('openai' or 'anthropic') | `'openai'` |
| `REACT_APP_AI_MODEL` | Model to use | `'gpt-4'` |
| `REACT_APP_AI_ENDPOINT` | Custom API endpoint | Provider default |

### Configuration Object

You can also configure settings programmatically:

```javascript
import { updateConfig, getConfig } from './chat';

// View current configuration
console.log(getConfig());

// Update configuration
updateConfig({
  temperature: 0.5,
  maxTokens: 2000,
  timeout: 60000,
  fallbackToMock: true,
});
```

---

## API Key Setup

### OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key and set it as `REACT_APP_AI_API_KEY`

```env
REACT_APP_AI_API_KEY=sk-...
REACT_APP_AI_PROVIDER=openai
REACT_APP_AI_MODEL=gpt-4
```

### Anthropic (Claude)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to API Keys
3. Create a new API key
4. Copy the key and configure:

```env
REACT_APP_AI_API_KEY=sk-ant-...
REACT_APP_AI_PROVIDER=anthropic
REACT_APP_AI_MODEL=claude-3-sonnet-20240229
```

### Custom Provider

For custom AI providers, implement your own handler:

```javascript
import { updateConfig } from './chat';

updateConfig({
  provider: 'custom',
  apiEndpoint: 'https://your-api.com/v1/chat',
});
```

Then modify `aiService.js` to add your custom handler in the `searchCandidates` function.

---

## File Structure

```
src/chat/
├── index.js           # Main entry point, exports all functions
├── config.js          # Configuration and API key management
├── aiService.js       # AI API communication and prompts
├── candidateScoring.js # Score to visual conversion utilities
├── searchUtils.js     # Query parsing and text search helpers
├── useAISearch.js     # React hook for component integration
└── README.md          # This documentation
```

### File Descriptions

| File | Purpose |
|------|---------|
| `config.js` | Manages API keys, provider settings, and configuration |
| `aiService.js` | Handles AI API calls for OpenAI/Anthropic, contains system prompts |
| `candidateScoring.js` | Converts scores (0-100) to match bars, sorting, filtering |
| `searchUtils.js` | Query parsing, criteria extraction, fallback text search |
| `useAISearch.js` | React hook that ties everything together |
| `index.js` | Convenient re-exports for importing |

---

## Usage Examples

### Basic Search

```javascript
import { searchCandidates } from './chat';

const results = await searchCandidates(
  "Find accountants with 5+ years experience who speak English",
  candidatesArray
);

console.log(results);
// {
//   success: true,
//   results: [
//     { candidateId: 1, score: 85, explanation: "..." },
//     { candidateId: 2, score: 72, explanation: "..." },
//   ],
//   searchCriteria: ["accountant", "5+ years", "English"]
// }
```

### Converting Scores to Match Bars

```javascript
import { scoreToMatchBars, applyScoresToCandidates } from './chat';

// Single score conversion
const matchBars = scoreToMatchBars(75);
// [true, true, true, true, true, true, false, false]

// Apply AI results to candidates
const updatedCandidates = applyScoresToCandidates(candidates, aiResults.results);
// Each candidate now has updated matchBars based on their AI score
```

### Sorting and Filtering

```javascript
import { sortByScore, filterByMinScore, getSearchStats } from './chat';

// Sort by score (highest first)
const sorted = sortByScore(candidates);

// Filter candidates with score >= 70
const qualified = filterByMinScore(candidates, 70);

// Get statistics
const stats = getSearchStats(candidates);
// { total: 6, excellent: 1, good: 2, moderate: 2, weak: 1, poor: 0, average: 68 }
```

### Query Analysis

```javascript
import { extractCriteria, extractYearsOfExperience, buildSearchParams } from './chat';

const criteria = extractCriteria("Senior accountant with CPA, 10 years experience");
// { skills: ["accountant"], experience: ["senior", "years", "experience"] }

const years = extractYearsOfExperience("Need someone with 10+ years");
// 10

const params = buildSearchParams("Find bilingual accountants");
// { rawQuery: "...", criteria: {...}, position: "accountant", ... }
```

### Text-Based Fallback Search

When AI is not configured, the system falls back to text search:

```javascript
import { simpleTextSearch } from './chat';

const results = simpleTextSearch("accounting experience", candidates);
// Returns candidates sorted by text match score
```

---

## Customization

### Modifying the AI Prompt

Edit `aiService.js` to customize how the AI evaluates candidates:

```javascript
const CANDIDATE_MATCHING_PROMPT = `Your custom prompt here...

Return JSON with this structure:
{
  "results": [{ "candidateId": 1, "score": 85, ... }]
}
`;
```

### Adding New Criteria Keywords

Edit `searchUtils.js`:

```javascript
export const CRITERIA_KEYWORDS = {
  education: ['degree', 'university', ...],
  experience: ['years', 'senior', ...],
  // Add your own categories
  technical: ['python', 'javascript', 'react', 'node'],
  soft_skills: ['leadership', 'communication', 'teamwork'],
};
```

### Changing Match Bar Count

Edit `candidateScoring.js`:

```javascript
export const TOTAL_BARS = 10; // Change from 8 to 10 bars
```

### Custom Score Colors

Add to your CSS:

```css
.score-excellent { color: #22c55e; }
.score-good { color: #3b82f6; }
.score-moderate { color: #eab308; }
.score-weak { color: #f97316; }
.score-poor { color: #ef4444; }
```

---

## API Reference

### config.js

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `setApiKey(key)` | `string` | `void` | Set the API key |
| `getApiKey()` | - | `string` | Get current API key |
| `isApiKeyConfigured()` | - | `boolean` | Check if key is set |
| `updateConfig(config)` | `object` | `void` | Merge config options |
| `getConfig()` | - | `object` | Get full config |
| `setProvider(provider, endpoint?)` | `string, string?` | `void` | Set AI provider |

### aiService.js

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `searchCandidates(query, candidates)` | `string, array` | `Promise<object>` | Main search function |
| `validateQuery(query)` | `string` | `object` | Validate search query |
| `getSystemPrompt()` | - | `string` | Get AI system prompt |

### candidateScoring.js

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `scoreToMatchBars(score)` | `number` | `boolean[]` | Convert 0-100 to bars |
| `matchBarsToScore(bars)` | `boolean[]` | `number` | Convert bars to percentage |
| `getScoreCategory(score)` | `number` | `string` | Get category label |
| `applyScoresToCandidates(candidates, results)` | `array, array` | `array` | Apply AI scores |
| `sortByScore(candidates)` | `array` | `array` | Sort by score desc |
| `filterByMinScore(candidates, min)` | `array, number` | `array` | Filter by threshold |
| `getSearchStats(candidates)` | `array` | `object` | Get statistics |

### useAISearch.js

| Hook Return | Type | Description |
|-------------|------|-------------|
| `query` | `string` | Current search query |
| `setQuery` | `function` | Update query |
| `candidates` | `array` | Candidates with scores |
| `isSearching` | `boolean` | Loading state |
| `error` | `string\|null` | Error message |
| `search` | `function` | Trigger search |
| `clearSearch` | `function` | Reset to original |
| `stats` | `object\|null` | Search statistics |
| `isAIConfigured` | `boolean` | API key status |
| `hasSearched` | `boolean` | Search performed |

---

## Troubleshooting

### "AI API key not configured"

Set your API key via environment variable or programmatically. See [API Key Setup](#api-key-setup).

### Search returns mock data

This happens when:
1. API key is not set
2. API call failed and `fallbackToMock` is enabled

Check the console for specific error messages.

### CORS errors

If calling AI APIs directly from the browser, you may need a proxy server. Consider:
1. Using a backend proxy
2. Setting up serverless functions
3. Using a CORS proxy service (for development only)

### Rate limiting

AI providers have rate limits. Implement:
1. Debouncing (already included in the hook)
2. Caching of results
3. Request queuing

---

## Security Notes

1. **Never commit API keys** - Use environment variables
2. **Use .env.local** for local development (gitignored by default)
3. **Consider backend proxy** for production to hide API keys
4. **Implement rate limiting** to prevent abuse

---

## Contributing

To add new features:

1. Add new utility functions to appropriate file
2. Export from `index.js`
3. Update this README
4. Add JSDoc comments for documentation

---

## License

Part of the CRM application. Internal use only.
