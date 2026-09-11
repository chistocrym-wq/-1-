const MAX_TEXT_LENGTH = 3500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Проверка письма пока не подключена: на сервере отсутствует OPENAI_API_KEY.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const text = String(body.text || '').trim();
    const situation = String(body.situation || '').trim();
    const points = Array.isArray(body.points) ? body.points.map(String).slice(0, 3) : [];

    if (!text) return res.status(400).json({ error: 'Сначала напишите текст.' });
    if (text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: 'Текст слишком длинный.' });
    if (!situation || points.length !== 3) return res.status(400).json({ error: 'Некорректное задание Schreiben.' });

    const wordCount = countWords(text);
    const evaluation = await evaluate({ apiKey, text, situation, points, wordCount });

    const contentEarned = evaluation.contentPoints.reduce((sum, point) => sum + Number(point.earned || 0), 0);
    const communicationEarned = Number(evaluation.communication.earned || 0);
    const earned = contentEarned + communicationEarned;
    const score = Math.round((earned / 10) * 100);

    return res.status(200).json({
      score,
      earned,
      max: 10,
      wordCount,
      contentPoints: evaluation.contentPoints,
      communication: evaluation.communication,
      feedbackRu: evaluation.feedbackRu,
      feedbackDe: evaluation.feedbackDe,
      corrections: evaluation.corrections,
    });
  } catch (error) {
    console.error('check-schreiben error', error);
    return res.status(500).json({
      error: 'Не удалось проверить письмо. Попробуйте ещё раз через несколько секунд.',
    });
  }
}

function countWords(text) {
  return text.split(/\s+/u).map((x) => x.trim()).filter(Boolean).length;
}

async function evaluate({ apiKey, text, situation, points, wordCount }) {
  const system = `Ты экзаменатор-тренер Goethe-Zertifikat A1 Schreiben Teil 2.
Проверяй только уровень A1 и выполнение коммуникативной задачи. Не требуй B1/B2.

Оценка максимально 10 баллов:
- каждый из 3 пунктов задания: 3 = выполнен и понятен, 1.5 = выполнен частично/неясно, 0 = не выполнен;
- Kommunikative Gestaltung: 1 = текст уместен и понятен как короткое сообщение/письмо, 0.5 = частично, 0 = не выполняет формат.

Если смысл понятен, небольшие ошибки грамматики, артиклей, окончаний или орфографии НЕ должны обнулять содержание. Засчитывай естественные эквивалентные формулировки A1, а не только точные слова из задания. Около 30 слов — ориентир, а не причина автоматически ставить 0.

corrections: только реальные ошибки, максимум 6. original — дословный короткий фрагмент ученика. corrected — естественная исправленная версия A1. explanation — сначала краткий немецкий термин (например Wortstellung, Artikel, Verbform), затем простое объяснение по-русски. Не придумывай ошибку, если фрагмент нормальный. Для отсутствующего пункта не добавляй correction — это отражается в contentPoints.
feedbackRu и feedbackDe — коротко, конкретно и доброжелательно.`;

  const user = `Задание:\n${situation}\n\nТри обязательных пункта:\n1. ${points[0]}\n2. ${points[1]}\n3. ${points[2]}\n\nТекст ученика (${wordCount} слов):\n${text}`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['contentPoints', 'communication', 'feedbackRu', 'feedbackDe', 'corrections'],
    properties: {
      contentPoints: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          type: 'object',
          additionalProperties: false,
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
        type: 'object',
        additionalProperties: false,
        required: ['earned', 'commentRu'],
        properties: {
          earned: { type: 'number', enum: [0, 0.5, 1] },
          commentRu: { type: 'string' },
        },
      },
      feedbackRu: { type: 'string' },
      feedbackDe: { type: 'string' },
      corrections: {
        type: 'array',
        maxItems: 6,
        items: {
          type: 'object',
          additionalProperties: false,
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

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5',
      store: false,
      reasoning: { effort: 'minimal' },
      max_output_tokens: 4000,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'schreiben_feedback',
          strict: true,
          schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI evaluation failed: ${response.status} ${detail.slice(0, 600)}`);
  }

  const payload = await response.json();
  const outputText = payload.output
    ?.flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .find((item) => item.type === 'output_text')?.text;

  if (!outputText) throw new Error('Empty evaluation response');
  return JSON.parse(outputText);
}
