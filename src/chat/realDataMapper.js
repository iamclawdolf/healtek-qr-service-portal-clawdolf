import { scoreToMatchBars } from './candidateScoring';

const today = () => new Date().toLocaleDateString('cs-CZ');

function sanitizeSnippet(snippet) {
  if (!snippet) {
    return '-';
  }

  return snippet
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function extractField(lines, label) {
  const target = label.toLowerCase();
  const line = lines.find((entry) => entry.toLowerCase().startsWith(target));
  if (!line) {
    return null;
  }

  const [, ...rest] = line.split(':');
  return rest.join(':').trim() || null;
}

function buildSummary(snippetLines, metadata) {
  const paragraphs = snippetLines.filter(Boolean);
  const intro = metadata.summaryIntro
    || paragraphs[0]
    || metadata.name
    || 'No summary available.';

  const body = paragraphs.slice(1, 3).join(' ') || metadata.lastEmployment || '-';
  const detail = paragraphs.slice(3).join(' ') || metadata.requiredEmployment || '-';

  const listItems = [
    metadata.location && `Location: ${metadata.location}`,
    metadata.lastEmployment && `Last employment: ${metadata.lastEmployment}`,
    metadata.requiredEmployment && `Role preference: ${metadata.requiredEmployment}`,
    metadata.requiredSalary && `Salary expectation: ${metadata.requiredSalary}`,
  ].filter(Boolean);

  return {
    intro,
    body,
    detail,
    listTitle: 'Highlights',
    listItems: listItems.length > 0 ? listItems : ['No structured data provided.'],
  };
}

function buildTimeline(result, metadata, snippet) {
  const scorePercent = Math.round((result.score ?? 0) * 100);
  const semanticPercent = Math.round((result.scoreComponents?.semantic ?? 0) * 100);

  return [
    {
      type: 'form',
      title: 'Semantic relevance',
      subtitle: 'Vector search',
      app: 'Search Engine',
      date: today(),
      tag: { label: 'Score', value: `${scorePercent}%`, dot: 'green' },
      hasBadge: true,
    },
    {
      type: 'email',
      title: 'BM25 component',
      subtitle: 'Keyword match',
      app: 'Search Engine',
      date: today(),
      tag: { label: 'Score', value: `${Math.round((result.scoreComponents?.bm25 ?? 0) * 100)}%` },
    },
    {
      type: 'email-sent',
      title: metadata.name || `Candidate ${result.subjectId}`,
      subtitle: 'Profile snippet',
      app: 'Dataset',
      date: today(),
      emailSubject: metadata.requiredEmployment || 'Profile overview',
      emailPreview: snippet.slice(0, 280),
      hasExpand: true,
    },
    {
      type: 'form',
      title: 'Semantic score (raw)',
      subtitle: 'Model output',
      app: 'Search Engine',
      date: today(),
      tag: { label: 'Semantic', value: `${semanticPercent}%`, dot: 'blue' },
    },
  ];
}

function createMetadata(snippet) {
  const lines = snippet.split('\n').map((line) => line.trim()).filter(Boolean);
  const metadata = {
    name: extractField(lines, 'NAME') || null,
    location: extractField(lines, 'LOCATION') || null,
    lastEmployment: extractField(lines, 'LAST EMPLOYMENT') || null,
    requiredEmployment: extractField(lines, 'REQUIRED EMPLOYMENT') || null,
    requiredSalary: extractField(lines, 'REQUIRED SALARY') || null,
    availability: extractField(lines, 'AVAILABILITY') || null,
    summaryIntro: extractField(lines, '* SUMMARY') || null,
  };

  return { metadata, lines };
}

function toCandidate(result, index) {
  // New API format ONLY:
  // { subjectId, name, bestScore, documents: [{ documentId, filename, score, snippet, aiExtracted? }] }

  // Validate required fields
  if (result.subjectId === undefined) {
    throw new Error(`Invalid API response: missing 'subjectId' at result[${index}]. Expected new format.`);
  }
  if (!Array.isArray(result.documents) || result.documents.length === 0) {
    throw new Error(`Invalid API response: missing or empty 'documents' array at result[${index}]. Expected new format.`);
  }

  const documents = result.documents;
  const bestDoc = documents[0];
  const ai = bestDoc.aiExtracted;

  const snippet = sanitizeSnippet(bestDoc.snippet);
  const { metadata, lines } = createMetadata(snippet);
  const summary = buildSummary(lines, metadata);
  const scorePercent = Math.round((result.bestScore ?? 0) * 100);

  return {
    id: result.subjectId,
    name: result.name || ai?.name || metadata.name || `Candidate ${result.subjectId}`,
    date: today(),
    leadId: String(result.subjectId),
    matchBars: scoreToMatchBars(scorePercent),
    aiScore: scorePercent,
    status: (ai && ai.requiredEmployment) || metadata.requiredEmployment || 'Prospect',
    email: (ai && ai.email) || '-',
    phone: (ai && ai.phone) || '-',
    address: (ai && ai.location) || metadata.location || '-',
    summary,
    aiExtracted: ai,
    timeline: buildTimeline(result, metadata, snippet),
    snippet,
    documents: documents.map(doc => ({
      documentId: doc.documentId,
      filename: doc.filename,
      score: Math.round((doc.score ?? 0) * 100),
      snippet: sanitizeSnippet(doc.snippet),
      aiExtracted: doc.aiExtracted
    })),
    _rawResult: result,
  };
}

/**
 * Enrich a candidate object with AI-extracted metadata.
 *
 * @param {object} candidate - Candidate object from mapRealResults.
 * @param {object} metadata - Metadata from fetchCvMetadata API.
 * @returns {object} Enriched candidate object.
 */
export function enrichWithMetadata(candidate, metadata) {
  if (!metadata || !metadata.aiExtracted) {
    return candidate;
  }

  const ai = metadata.aiExtracted;

  return {
    ...candidate,
    name: ai.name || candidate.name,
    email: ai.email || candidate.email,
    phone: ai.phone || candidate.phone,
    address: ai.location || candidate.address,
    aiExtracted: ai,
    cvMetadata: metadata,
  };
}

/**
 * Transform raw API results into UI-friendly candidate objects.
 *
 * @param {Array} results - Raw results returned by fetchRealCandidates.
 * @returns {Array} Candidates ready for rendering.
 */
export function mapRealResults(results) {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map(toCandidate);
}

export default mapRealResults;


