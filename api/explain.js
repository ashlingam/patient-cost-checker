// Vercel serverless function: /api/explain
// Locked prompt template, structured inputs only (PRD sections 8 and 10).
// Set ANTHROPIC_API_KEY in Vercel project environment variables.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'no key configured' })
  }
  const i = req.body || {}
  const prompt = [
    'You write short, plain-language explanations of healthcare cost estimates for patients.',
    'Rules: never change or recompute any number you are given; never give medical or coverage advice;',
    'never guarantee a price; 2 to 3 sentences; warm, direct, eighth-grade reading level; no jargon',
    'without a plain-word gloss. Output plain prose only: no markdown, no asterisks, no bold,',
    'no headers, no bullet points, no blockquotes.',
    '',
    'Structured estimate inputs (JSON):',
    JSON.stringify(i, null, 2),
    '',
    'Explain to the patient why their estimated cost is what it is, what drives the range,',
    'and what their deductible or copay status means for this visit.',
  ].join('\n')
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await r.json()
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    const clean = text
      .replace(/\*\*/g, '')
      .replace(/^#+\s*/gm, '')
      .replace(/^>\s*/gm, '')
      .replace(/\n{2,}/g, ' ')
    return res.status(200).json({ explanation: clean })
  } catch (e) {
    return res.status(500).json({ error: 'upstream failure' })
  }
}
