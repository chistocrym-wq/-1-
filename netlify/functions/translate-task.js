const MAX_PARTS = 40;
const MAX_TOTAL = 7000;

export default async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  if (!apiKey || !baseUrl) return json({ error: 'Русский перевод сейчас недоступен.' }, 503);

  try {
    const body = await req.json().catch(() => ({}));
    const parts = Array.isArray(body.parts)
      ? body.parts.map((value) => String(value || '').trim()).filter(Boolean).slice(0, MAX_PARTS)
      : [];

    if (!parts.length) return json({ error: 'Нет текста для перевода.' }, 400);
    if (parts.join('\n').length > MAX_TOTAL) return json({ error: 'Слишком большой текст для перевода.' }, 413);

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'Переведи каждый элемент массива с немецкого на простой естественный русский для уровня A1. Переводи строго смысл, имена, даты, время и числа сохраняй. Если элемент уже написан по-русски, верни его без изменений. Не решай задание, не подсказывай правильный ответ и не добавляй объяснений. Верни ровно столько переводов, сколько входных элементов.',
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
    return json({ translations: parsed.translations });
  } catch (error) {
    console.error('translate-task error', error);
    return json({ error: 'Не удалось открыть перевод. Попробуйте ещё раз.' }, 500);
  }
};

export const config = { path: '/api/translate-task' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}
