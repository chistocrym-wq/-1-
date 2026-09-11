const MAX_TEXT_LENGTH = 3500;
const MAX_IMAGE_LENGTH = 9_000_000;

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  if (!apiKey || !baseUrl) {
    return json({ error: 'Проверка письма сейчас недоступна.' }, 503);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body.text || '').trim();
    const imageDataUrl = String(body.imageDataUrl || '').trim();
    const situation = String(body.situation || '').trim();
    const points = Array.isArray(body.points) ? body.points.map(String).slice(0, 3) : [];

    if (!text && !imageDataUrl) return json({ error: 'Напишите письмо или добавьте фото.' }, 400);
    if (text.length > MAX_TEXT_LENGTH) return json({ error: 'Текст слишком длинный.' }, 413);
    if (imageDataUrl && (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageDataUrl) || imageDataUrl.length > MAX_IMAGE_LENGTH)) {
      return json({ error: 'Фото должно быть JPG, PNG или WEBP размером до 6 МБ.' }, 400);
    }
    if (!situation || points.length !== 3) return json({ error: 'Некорректное задание Schreiben.' }, 400);

    const result = await evaluate({ apiKey, baseUrl, text, imageDataUrl, situation, points });
    const contentEarned = result.contentPoints.reduce((sum, point) => sum + Number(point.earned || 0), 0);
    const communicationEarned = Number(result.communication?.earned || 0);
    const earned = contentEarned + communicationEarned;

    return json({
      ...result,
      earned,
      max: 10,
      score: Math.round((earned / 10) * 100),
      wordCount: countWords(result.recognizedText || text),
    });
  } catch (error) {
    console.error('check-schreiben error', error);
    return json({ error: 'Не удалось проверить письмо. Попробуйте ещё раз.' }, 500);
  }
};

export const config = { path: '/api/check-schreiben' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/u).filter(Boolean).length;
}

async function evaluate({ apiKey, baseUrl, text, imageDataUrl, situation, points }) {
  const system = `Ты экзаменатор-тренер Zertifikat A1 Schreiben Teil 2.
Проверь короткое письмо на уровне A1. Если приложено фото, сначала точно распознай рукописный или печатный немецкий текст и верни его в recognizedText.
Не требуй языка выше A1. Максимум 10 баллов: каждый из 3 пунктов — 3 / 1.5 / 0; структура письма — 1 / 0.5 / 0.
Слова из задания можно повторять. Небольшие грамматические и орфографические ошибки не обнуляют понятный пункт.
corrections — только реальные ошибки, максимум 6.`;

  const prompt = `Задание:\n${situation}\n\nПункты:\n1. ${points[0]}\n2. ${points[1]}\n3. ${points[2]}\n\n${text ? `Текст ученика:\n${text}` : 'Текст находится на приложенном фото.'}`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['recognizedText', 'contentPoints', 'communication', 'feedbackRu', 'feedbackDe', 'corrections'],
    properties: {
      recognizedText: { type: 'string' },
      contentPoints: {
        type: 'array', minItems: 3, maxItems: 3,
        items: {
          type: 'object', additionalProperties: false,
          required: ['point', 'earned', 'status', 'commentRu'],
          properties: {
            point: { type: 'string' },
            earned: { type: 'number', enum: [0, 1.5, 3] },
            status: { type: 'string', enum: ['erfuellt', 'teilweise', 'fehlt'] },
            commentRu: { type: 'string' },
          },
        },
      },
      communication: {
        type: 'object', additionalProperties: false,
        required: ['earned', 'commentRu'],
        properties: {
          earned: { type: 'number', enum: [0, 0.5, 1] },
          commentRu: { type: 'string' },
        },
      },
      feedbackRu: { type: 'string' },
      feedbackDe: { type: 'string' },
      corrections: {
        type: 'array', maxItems: 6,
        items: {
          type: 'object', additionalProperties: false,
          required: ['original', 'corrected', 'explanation'],
          properties: {
            original: { type: 'string' },
            corrected: { type: 'string' },
            explanation: { type: 'string' },
          },
        },
      },
    },
  };

  const content = [{ type: 'input_text', text: prompt }];
  if (imageDataUrl) content.push({ type: 'input_image', image_url: imageDataUrl });

  const response = await fetch(`${baseUrl}/v1/responses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-5',
      store: false,
      reasoning: { effort: 'minimal' },
      max_output_tokens: 3500,
      input: [
        { role: 'system', content: system },
        { role: 'user', content },
      ],
      text: { format: { type: 'json_schema', name: 'schreiben_feedback', strict: true, schema } },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI Gateway ${response.status}: ${detail.slice(0, 500)}`);
  }

  const payload = await response.json();
  const outputText = payload.output
    ?.flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .find((item) => item.type === 'output_text')?.text;

  if (!outputText) throw new Error('Empty evaluation response');
  return JSON.parse(outputText);
}
