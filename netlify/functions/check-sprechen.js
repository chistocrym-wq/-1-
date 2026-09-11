const MAX_AUDIO_BASE64 = 4_000_000;
const MODEL = 'gemini-3.8-flash';

export default async (req) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GOOGLE_GEMINI_BASE_URL;

  if (req.method === 'GET') {
    return json({ ok: true, aiConfigured: Boolean(apiKey && baseUrl), model: MODEL });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, POST' });
  if (!apiKey || !baseUrl) return json({ error: 'AI-проверка речи сейчас недоступна.', code: 'missing_ai_gateway' }, 503);

  try {
    const body = await req.json().catch(() => ({}));
    const audioBase64 = String(body.audioBase64 || '');
    const mimeType = normalizeMimeType(body.mimeType);
    const mode = String(body.mode || '');
    if (!audioBase64) return json({ error: 'Аудиозапись не получена.', code: 'missing_audio' }, 400);
    if (audioBase64.length > MAX_AUDIO_BASE64) return json({ error: 'Запись слишком длинная. Сделайте ответ короче.', code: 'audio_too_large' }, 413);
    if (!['teil1','teil2','teil3','free'].includes(mode)) return json({ error: 'Неизвестный тип задания Sprechen.', code: 'bad_mode' }, 400);

    const task = buildTaskDescription(body);
    const prompt = `Ты — проверяющий устной речи немецкого уровня A1 в тренажёре Отто.

Прослушай приложенную аудиозапись. Сначала точно распознай сказанное на немецком и верни это в transcript. Затем оцени ответ именно по заданию ниже.

Правила:
- оценивай смысл и коммуникацию, а не письменную орфографию транскрипта;
- не требуй грамматику выше A1;
- небольшие ошибки допустимы, если смысл понятен;
- естественный акцент сам по себе не снижает балл;
- score: 0–100;
- feedbackRu: коротко и конкретно на русском, что получилось и что исправить;
- feedbackDe: одна очень простая полезная фраза/подсказка на немецком;
- missing: только реально отсутствующие пункты задания, максимум 8.

Задание:
${task}`;

    const response = await fetch(`${baseUrl}/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [
          { text: prompt },
          { inlineData: { mimeType, data: audioBase64 } },
        ] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            required: ['transcript','score','feedbackRu','feedbackDe','missing'],
            properties: {
              transcript: { type: 'STRING' },
              score: { type: 'INTEGER', minimum: 0, maximum: 100 },
              feedbackRu: { type: 'STRING' },
              feedbackDe: { type: 'STRING' },
              missing: { type: 'ARRAY', items: { type: 'STRING' }, maxItems: 8 },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Gemini audio check failed', response.status, detail.slice(0, 1200));
      if (response.status === 429) return json({ error: 'AI сейчас перегружен. Повторите проверку через несколько секунд.', code: 'ai_limit' }, 429);
      return json({ error: 'Отто не смог обработать запись. Попробуйте ещё раз или запишите ответ короче.', code: 'ai_error' }, 502);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim();
    if (!text) throw new Error('Gemini returned empty response');
    const parsed = JSON.parse(stripFences(text));
    return json({
      transcript: String(parsed.transcript || '').trim(),
      score: Number.isFinite(Number(parsed.score)) ? Math.max(0, Math.min(100, Math.round(Number(parsed.score)))) : 0,
      feedbackRu: String(parsed.feedbackRu || '').trim(),
      feedbackDe: String(parsed.feedbackDe || '').trim(),
      missing: Array.isArray(parsed.missing) ? parsed.missing.map(String).filter(Boolean).slice(0, 8) : [],
    });
  } catch (error) {
    console.error('check-sprechen error', error);
    return json({ error: 'Не удалось проверить запись. Попробуйте ещё раз.', code: 'server_error' }, 500);
  }
};

export const config = { path: '/api/check-sprechen' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}
function normalizeMimeType(value) {
  const mime = String(value || 'audio/webm').toLowerCase().split(';')[0].trim();
  return mime.startsWith('audio/') ? mime : 'audio/webm';
}
function stripFences(value) {
  return String(value).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}
function buildTaskDescription(body) {
  if (body.mode === 'teil1') {
    const expected = Array.isArray(body.expectedPoints) ? body.expectedPoints.join(', ') : '';
    return `Teil 1: Sich vorstellen. Нужно по смыслу раскрыть пункты: ${expected}.`;
  }
  if (body.mode === 'teil2') {
    return `Teil 2: Fragen stellen. Тема: ${String(body.theme || '')}. Ключевое слово: ${String(body.keyword || '')}. Нужно задать один понятный вопрос по теме и слову. Пример только ориентир: ${String(body.sampleQuestion || '')}`;
  }
  if (body.mode === 'teil3') {
    return `Teil 3: Bitten formulieren. На карточке: ${String(body.object || '')}. Нужно сформулировать понятную бытовую просьбу или вопрос по картинке. Пример только ориентир: ${String(body.sampleRequest || '')}`;
  }
  const expected = Array.isArray(body.expectedPoints) ? body.expectedPoints.join(' | ') : '';
  return `Freies Sprechen. Тема: ${String(body.title || '')}. Нужно коротко и связно раскрыть: ${expected}.`;
}
