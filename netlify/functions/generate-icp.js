// Netlify serverless function backing the live ICP Generator on /work/tools.html.
//
// Setup after deploying to Netlify:
//   1. Site settings -> Environment variables -> add ANTHROPIC_API_KEY
//      (get one at https://console.anthropic.com/settings/keys)
//   2. Optional: add ALLOWED_ORIGIN = "https://your-live-domain.com" once you
//      know it, to reject calls that don't come from your own site. Left
//      unset, the function accepts requests from anywhere -- fine to start,
//      but since this endpoint spends YOUR API credits on every call, also set
//      a spend limit / usage alert on the Anthropic account so a traffic spike
//      or a bot finding the URL can't run up an unbounded bill.
//
// The front end never sees the API key: it POSTs form fields here, this
// function calls the real Anthropic API server-side, and returns the result.

const MODEL_BY_DEPTH = {
  standard: 'claude-sonnet-5',
  deep: 'claude-opus-5',
};
const MAX_TOKENS_BY_DEPTH = {
  standard: 6000,
  deep: 10000,
};

const ICP_TOOL = {
  name: 'generate_icp',
  description: 'Return one complete, structured, research-grounded ideal customer profile for the given product.',
  input_schema: {
    type: 'object',
    properties: {
      executive_snapshot: {
        type: 'string',
        description: 'A tight 3-4 sentence summary of who this ICP is and why they matter, written for a founder skimming fast.',
      },
      primary_persona: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'A realistic first name plus one-line role, e.g. "Priya, 32, first-time investor".' },
          tagline: { type: 'string', description: 'A short first-person quote capturing their mindset, in their own voice.' },
          narrative: { type: 'string', description: 'A vivid 4-6 sentence "meet this person" bio grounding them in a specific life or work context.' },
          demographics: { type: 'array', items: { type: 'string' }, description: '5-7 concrete demographic or firmographic facts.' },
          psychographics: { type: 'array', items: { type: 'string' }, description: '5-7 values, attitudes, and beliefs that shape how they buy.' },
        },
        required: ['name', 'tagline', 'narrative', 'demographics', 'psychographics'],
      },
      day_in_the_life: { type: 'string', description: '4-6 sentences on the context in which this problem actually shows up for them day to day.' },
      core_pains: {
        type: 'array',
        items: {
          type: 'object',
          properties: { pain: { type: 'string' }, why_it_matters: { type: 'string' } },
          required: ['pain', 'why_it_matters'],
        },
        description: '5-7 ranked pains, most urgent first.',
      },
      jobs_to_be_done: { type: 'array', items: { type: 'string' }, description: '4-6 functional, emotional, and social jobs they are hiring this product to do.' },
      buying_triggers: { type: 'array', items: { type: 'string' }, description: '4-6 specific moments or events that push them to act now rather than later.' },
      objections: {
        type: 'array',
        items: {
          type: 'object',
          properties: { objection: { type: 'string' }, reframe: { type: 'string' } },
          required: ['objection', 'reframe'],
        },
        description: '4-6 real objections and a credible reframe for each.',
      },
      decision_process: { type: 'string', description: 'Who is involved in the decision and how it actually gets made -- especially who else needs to sign off if this is B2B.' },
      attention_channels: { type: 'array', items: { type: 'string' }, description: '5-8 specific places or formats where this persona actually spends attention, not generic "social media".' },
      current_alternatives: { type: 'array', items: { type: 'string' }, description: '4-6 things they use or do today instead of this product, including "doing nothing" if realistic.' },
      messaging_pillars: { type: 'array', items: { type: 'string' }, description: '3-5 core messaging pillars the brand should stand on for this ICP.' },
      content_angles: { type: 'array', items: { type: 'string' }, description: '6-9 specific, non-generic content angles that would convert this ICP.' },
      sample_hooks: { type: 'array', items: { type: 'string' }, description: '5-8 ready-to-use ad headlines or hooks written in a real creative voice, not fill-in-the-blank templates.' },
      secondary_persona: {
        type: 'object',
        properties: { name: { type: 'string' }, one_liner: { type: 'string' } },
        required: ['name', 'one_liner'],
        description: 'A believable secondary or edge segment worth knowing about.',
      },
      pricing_sensitivity: { type: 'string', description: '2-4 sentences on willingness to pay and how to price or frame the offer for this ICP.' },
      validation_metrics: { type: 'array', items: { type: 'string' }, description: '4-6 concrete signals to track to confirm this ICP is right in practice, not just on paper.' },
      caveats: { type: 'string', description: 'An honest 2-3 sentence note on what this ICP assumes and what should be validated with real customer research before being trusted fully.' },
    },
    required: [
      'executive_snapshot', 'primary_persona', 'day_in_the_life', 'core_pains',
      'jobs_to_be_done', 'buying_triggers', 'objections', 'decision_process',
      'attention_channels', 'current_alternatives', 'messaging_pillars',
      'content_angles', 'sample_hooks', 'secondary_persona',
      'pricing_sensitivity', 'validation_metrics', 'caveats',
    ],
  },
};

function cap(str, max) {
  return String(str || '').trim().slice(0, max);
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin) headers['Access-Control-Allow-Origin'] = allowedOrigin;

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };
  }
  if (allowedOrigin) {
    const origin = event.headers.origin || event.headers.referer || '';
    if (!origin.startsWith(allowedOrigin)) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Origin not allowed.' }) };
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on this deployment yet. Add it in Netlify: Site settings -> Environment variables.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const product = cap(body.product, 200);
  if (!product) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Product / service is required.' }) };
  }

  const description = cap(body.description, 600);
  const category = cap(body.category, 80);
  const price = cap(body.price, 60);
  const geography = cap(body.geography, 100);
  const businessModel = cap(body.businessModel, 60);
  const goal = cap(body.goal, 120);
  const competitors = cap(body.competitors, 300);
  const depth = body.depth === 'deep' ? 'deep' : 'standard';

  const model = MODEL_BY_DEPTH[depth];
  const maxTokens = MAX_TOKENS_BY_DEPTH[depth];

  const briefLines = [
    `Product / service: ${product}`,
    description && `What it does: ${description}`,
    category && `Category: ${category}`,
    price && `Price positioning: ${price}`,
    geography && `Target geography: ${geography}`,
    businessModel && `Business model: ${businessModel}`,
    goal && `Primary goal for this ICP: ${goal}`,
    competitors && `Known competitors / alternatives: ${competitors}`,
  ].filter(Boolean).join('\n');

  const systemPrompt = 'You are a senior brand strategist and consumer researcher. Given a brief about a product, '
    + 'produce one exhaustive, specific, non-generic ideal customer profile (ICP), grounded in how real buyers in '
    + 'that category actually behave, not template marketing language. Be concrete: use realistic names, real '
    + 'channel names, real objections, and reasonable estimates where numbers help, clearly framed as estimates. '
    + 'Avoid vague filler like "tech-savvy millennials who value quality." Call the generate_icp tool with the '
    + 'complete structured result and nothing else.';

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: briefLines }],
        tools: [ICP_TOOL],
        tool_choice: { type: 'tool', name: 'generate_icp' },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: `Claude API error (${resp.status}).`, detail: errText.slice(0, 500) }),
      };
    }

    const data = await resp.json();
    const toolBlock = (data.content || []).find((b) => b.type === 'tool_use' && b.name === 'generate_icp');
    if (!toolBlock) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Claude did not return a structured ICP. Please try again.' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ icp: toolBlock.input, model, depth }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unexpected server error.', detail: String(err).slice(0, 300) }) };
  }
};
