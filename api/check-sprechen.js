const MAX_AUDIO_BYTES = 7 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Проверка речи пока не подключена: на сервере отсутствует OPENAI_API_KEY.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { audioBase64, mimeType = 'audio/webm', mode } = body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Аудиозапись не получена.' });
    }

    if (!['teil1', 'teil2', 'teil3', 'free'].includes(mode)) {
      return res.status(400).json({ error: 'Неизвестный тип задания Sprechen.' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) {
      return res.status(400).json({ error: 'Аудиозапись пустая.' });
    }
    if (audioBuffer.length > MAX_AUDIO_BYTES) {
      return res.status(413).json({ error: 'Запись слишком длинная. Запишите более короткий ответ.' });
    }

    const transcript = await transcribeAudio({ apiKey, audioBuffer, mimeType });
    if (!transcript.trim()) {
      return res.status(422).json({ error: 'Не удалось распознать немецкую речь. Попробуйте записать ответ ещё раз.' });
    }

    const evaluation = await evaluateAnswer({ apiKey, transcript, body });
    return res.status(200).json({ ...evaluation, transcript });
  } catch (error) {
    console.error('check-sprechen error', error);
    return res.status(500).json({
      error: 'Не удалось проверить ответ. Запись можно прослушать и продолжить тренировку.',
    });
  }
}

async function transcribeAudio({ apiKey, audioBuffer, mimeType }) {
  const form = new FormData();
  const safeMime = typeof mimeType === 'string' && mimeType.startsWith('audio/') ? mimeType : 'audio/webm';
  const extension = safeMime.includes('mp4') ? 'm4a' : safeMime.includes('wav') ? 'wav' : 'webm';
  const bytes = new Uint8Array(audioBuffer);

  form.append('file', new Blob([bytes], { type: safeMime }), `sprechen.${extension}`);
  form.append('model', 'gpt-4o-mini-transcribe');
  form.append('language', 'de');
  form.append('response_format', 'json');

  let response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const fallbackForm = new FormData();
    fallbackForm.append('file', new Blob([bytes], { type: safeMime }), `sprechen.${extension}`);
    fallbackForm.append('model', 'whisper-1');
    fallbackForm.append('language', 'de');
    fallbackForm.append('response_format', 'json');

    response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fallbackForm,
    });
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Transcription failed: ${response.status} ${detail.slice(0, 300)}`);
  }

  const payload = await response.json();
  return String(payload.text || '').trim();
}

async function evaluateAnswer({ apiKey, transcript, body }) {
  const task = buildTaskDescription(body);
  const systemPrompt = `Ты проверяешь только устную речь немецкого уровня A1 в учебном тренажёре Otto.
Проверяй смысл сказанного, а не письменную орфографию транскрипта.
Транскрипция может содержать ошибки распознавания, поэтому не придирайся к отдельным буквам и окончаниям, если смысл понятен.
Не требуй грамматику B1/B2. Небольшие грамматические ошибки допустимы, если коммуникация понятна.
Не выставляй фонетический балл и не утверждай, что измерил точное произношение: по транскрипту это невозможно.

Teil 1: проверь, прозвучали ли требуемые пункты о себе. Каждый пункт оценивай по смыслу. Отсутствующие пункты перечисли в missing.
Teil 2: полный результат, если ученик задал понятный вопрос, связанный и с темой, и с ключевым словом карточки. Допускай разные естественные формулировки A1, не требуй совпадения с примером.
Teil 3: полный результат, если ученик сформулировал понятную бытовую просьбу или вопрос, соответствующий изображённому предмету/действию. Допускай формы с bitte, Können Sie..., Kann ich..., а также короткие естественные просьбы.
Freies Sprechen: проверь, раскрыл ли ученик три опорных вопроса темы и получился ли понятный связный рассказ уровня A1. Не требуй длинного ответа и не штрафуй за естественные паузы. В missing перечисляй только действительно нераскрытые смысловые пункты.

Верни краткую поддержку на русском и одну очень простую подсказку на немецком. Не исправляй то, что уже корректно.`;

  const userPrompt = `Задание:\n${task}\n\nРаспознанная речь ученика:\n${transcript}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'sprechen_feedback',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['score', 'feedbackRu', 'feedbackDe', 'missing'],
            properties: {
              score: { type: 'integer', minimum: 0, maximum: 100 },
              feedbackRu: { type: 'string' },
              feedbackDe: { type: 'string' },
              missing: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Evaluation failed: ${response.status} ${detail.slice(0, 300)}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty evaluation response');

  const parsed = JSON.parse(content);
  return {
    score: Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, parsed.score)) : 0,
    feedbackRu: String(parsed.feedbackRu || ''),
    feedbackDe: String(parsed.feedbackDe || ''),
    missing: Array.isArray(parsed.missing) ? parsed.missing.map(String).slice(0, 10) : [],
  };
}

function buildTaskDescription(body) {
  if (body.mode === 'teil1') {
    const expected = Array.isArray(body.expectedPoints) ? body.expectedPoints.join(', ') : '';
    return `Teil 1. Ученик представляет себя. Нужно по смыслу покрыть пункты: ${expected}.`;
  }

  if (body.mode === 'teil2') {
    return `Teil 2. Тема: ${String(body.theme || '')}. Слово на карточке: ${String(body.keyword || '')}. Нужно задать один понятный вопрос партнёру. Пример допустимого вопроса дан только как ориентир и не является единственным ответом: ${String(body.sampleQuestion || '')}`;
  }

  if (body.mode === 'teil3') {
    return `Teil 3. На карточке изображено: ${String(body.object || '')}. Нужно сформулировать понятную бытовую просьбу или вопрос по карточке. Пример дан только как ориентир: ${String(body.sampleRequest || '')}`;
  }

  const expected = Array.isArray(body.expectedPoints) ? body.expectedPoints.join(' | ') : '';
  return `Freies Sprechen. Тема: ${String(body.title || '')}. Ученик должен коротко и связно раскрыть опорные вопросы: ${expected}. Естественные A1 формулировки принимаются.`;
}
