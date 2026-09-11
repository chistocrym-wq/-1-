const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

export default async (req) => {
  const apiKey = Netlify.env.get('OPENAI_API_KEY');

  if (req.method === 'GET') {
    return json({ ok: true, aiConfigured: Boolean(apiKey), maxAudioBytes: MAX_AUDIO_BYTES });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET, POST' });
  }

  if (!apiKey) {
    return json({
      error: 'AI-проверка речи не подключена: на сервере отсутствует OPENAI_API_KEY.',
      code: 'missing_api_key',
    }, 503);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { audioBase64, mimeType = 'audio/webm', mode } = body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return json({ error: 'Аудиозапись не получена.', code: 'missing_audio' }, 400);
    }
    if (!['teil1', 'teil2', 'teil3', 'free'].includes(mode)) {
      return json({ error: 'Неизвестный тип задания Sprechen.', code: 'bad_mode' }, 400);
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    if (!audioBuffer.length) return json({ error: 'Аудиозапись пустая.', code: 'empty_audio' }, 400);
    if (audioBuffer.length > MAX_AUDIO_BYTES) {
      return json({
        error: 'Запись слишком длинная для отправки. Сделайте ответ короче и запишите ещё раз.',
        code: 'audio_too_large',
      }, 413);
    }

    const transcript = await transcribeAudio({ apiKey, audioBuffer, mimeType });
    if (!transcript.trim()) {
      return json({
        error: 'Не удалось распознать немецкую речь. Говорите чуть громче и попробуйте записать ещё раз.',
        code: 'empty_transcript',
      }, 422);
    }

    const evaluation = await evaluateAnswer({ apiKey, transcript, body });
    return json({ ...evaluation, transcript });
  } catch (error) {
    console.error('check-sprechen error', error);

    if (error instanceof OpenAIRequestError) {
      if (error.status === 401 || error.status === 403) {
        return json({
          error: 'AI-проверка не авторизована. Нужно проверить OPENAI_API_KEY на сервере.',
          code: 'openai_auth',
        }, 502);
      }
      if (error.status === 429) {
        return json({
          error: 'Лимит OpenAI API временно исчерпан. Попробуйте ещё раз немного позже.',
          code: 'openai_limit',
        }, 429);
      }
      return json({
        error: 'OpenAI сейчас не смог обработать запись. Попробуйте ещё раз через несколько секунд.',
        code: 'openai_error',
      }, 502);
    }

    return json({
      error: 'Не удалось проверить ответ. Запись можно прослушать и попробовать отправить ещё раз.',
      code: 'server_error',
    }, 500);
  }
};

export const config = { path: '/api/check-sprechen' };

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

class OpenAIRequestError extends Error {
  constructor(status, detail) {
    super(`OpenAI request failed: ${status} ${detail}`);
    this.name = 'OpenAIRequestError';
    this.status = status;
  }
}

function normalizeMimeType(mimeType) {
  const raw = typeof mimeType === 'string' ? mimeType.toLowerCase().split(';')[0].trim() : '';
  if (!raw.startsWith('audio/')) return 'audio/webm';
  return raw;
}

function extensionForMime(mimeType) {
  const mime = normalizeMimeType(mimeType);
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a';
  return 'webm';
}

async function transcribeAudio({ apiKey, audioBuffer, mimeType }) {
  const safeMime = normalizeMimeType(mimeType);
  const extension = extensionForMime(safeMime);
  const bytes = new Uint8Array(audioBuffer);

  const callTranscription = async (model) => {
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: safeMime }), `sprechen.${extension}`);
    form.append('model', model);
    form.append('language', 'de');
    form.append('response_format', 'json');

    return fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  };

  let response = await callTranscription('gpt-4o-mini-transcribe');
  if (!response.ok) {
    const firstDetail = await response.text();
    console.warn('gpt-4o-mini-transcribe failed', response.status, firstDetail.slice(0, 300));
    response = await callTranscription('whisper-1');
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new OpenAIRequestError(response.status, detail.slice(0, 500));
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
    throw new OpenAIRequestError(response.status, detail.slice(0, 500));
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
