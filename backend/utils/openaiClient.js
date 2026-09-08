/**
 * Minimal OpenAI Chat Completions client using Node 18's built-in fetch (no
 * extra npm dependency). Both callers (services/tipService.js,
 * functions/async/categorizeTransaction.js) already guard on
 * `process.env.OPENAI_API_KEY` being set before calling these, so this module
 * throwing when the key is missing is fine - it should never be reached without one.
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function chatCompletion(messages, { maxTokens = 150, temperature = 0.7 } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI API error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Generate a short, personalized financial tip. `context` (optional) can carry
 * lightweight spending stats - see services/tipService.js - to make the tip
 * relevant instead of generic.
 */
async function generateTipForUser(userId, context = {}) {
  const { income, expenses, topCategory } = context;

  const contextLine = income != null && expenses != null
    ? `This user's recent income is KES ${income} and expenses are KES ${expenses}${topCategory ? `, with their biggest spending category being ${topCategory}` : ''}.`
    : 'No spending data is available for this user yet.';

  const content = await chatCompletion([
    {
      role: 'system',
      content: 'You are a friendly financial coach for a Kenyan budgeting app called BudgetBliss. Give one short, specific, actionable money tip (max 2 sentences, no preamble, no markdown).',
    },
    { role: 'user', content: contextLine },
  ], { maxTokens: 100 });

  return content || 'Track your daily coffee spending; small wins add up.';
}

/**
 * Suggest which of the user's existing categories a transaction belongs to.
 * `categoryNames` is the list of valid options - the model is constrained to
 * pick one of them (or "Other") rather than inventing new categories.
 */
async function suggestCategory(description, categoryNames) {
  const content = await chatCompletion([
    {
      role: 'system',
      content: `Classify the transaction description into exactly one of these categories: ${categoryNames.join(', ')}. Reply with only the category name, nothing else.`,
    },
    { role: 'user', content: description },
  ], { maxTokens: 20, temperature: 0 });

  const match = categoryNames.find((name) => name.toLowerCase() === content.toLowerCase());
  return match || null;
}

module.exports = { generateTipForUser, suggestCategory };
