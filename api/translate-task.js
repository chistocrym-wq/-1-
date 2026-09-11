const MAX_PARTS = 40;
const MAX_TOTAL = 7000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Русский перевод сейчас недоступен.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const parts = Array.isArray(body.parts)
      ? body.parts.map((value) => String(value || '').trim()).filter(Boolean).slice(0, MAX_PARTS)
      : [];

    if (!parts.length) return res.status(400).json({ error: 'Нет текста для перевода.' });
    if (parts.join('\n').length > MAX_TOTAL) return res.status(413).json({ error: 'Слишком большой текст для перевода.' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'Переведи каждый элемент массива с немецкого на простой естественный русский. Это учебный Goethe A1. Переводи строго смысл, имена, даты, время и числа сохраняй. Если элемент уже написан по-русски, верни его без изменений. Не решай задание, не подсказывай правильный ответ и не добавляй объяснений. Верни ровно столько переводов, сколько входных элементов.',
          },
          { role: 'user', content: JSON.stringify(parts) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'task_translations',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['translations'],
              properties: {
                translations: {
                  type: 'array',
                  minItems: parts.length,
                  maxItems: parts.length,
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) throw new Error(`translation failed: ${response.status}`);
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('empty translation');
    const parsed = JSON.parse(content);
    return res.status(200).json({ translations: parsed.translations });
  } catch (error) {
    console.error('translate-task error', error);
    return res.status(500).json({ error: 'Не удалось открыть перевод. Попробуйте ещё раз.' });
  }
}
