import type { AiSettings, InterviewQuestion, AiScoreResult } from '../types/question';

const AI_SETTINGS_KEY = 'interview_trainer_ai_settings';

// --- AI Settings persistence ---

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AiSettings;
  } catch { /* ignore */ }
  return { baseURL: '', apiKey: '', model: '' };
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
}

export function isAiConfigured(settings: AiSettings): boolean {
  return !!(settings.baseURL.trim() && settings.apiKey.trim() && settings.model.trim());
}

// --- OpenAI-compatible chat completion ---

interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

export async function callChatCompletion(
  settings: AiSettings,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const base = settings.baseURL.trim().replace(/\/+$/, '');
  const url = base.endsWith('/v1') ? `${base}/chat/completions` : `${base}/v1/chat/completions`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
    }),
    signal,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`API 请求失败 (${resp.status}): ${text.slice(0, 200) || resp.statusText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// --- Prompt builders ---

export function buildOptimizePrompt(q: InterviewQuestion): { system: string; user: string } {
  const shortAnswer = !q.userAnswer || q.userAnswer.trim().length < 15;

  return {
    system: shortAnswer
      ? `你是面试辅导专家。用户对这道题还没有实质性的回答（回答过短或未作答）。请不要替用户写完整答案，而是给出简要的思路提示和关键词引导，帮助用户回忆和组织回答方向。控制在3-5个要点以内，每个要点一两句话即可。直接输出内容，不要加额外说明。`
      : `你是面试辅导专家。请严格根据用户已有的回答进行优化。在保持用户原意的基础上：调整语序、补充遗漏的关键点、使逻辑更清晰、更适合面试口述。不要大幅重写或丢弃用户已说的内容，优化后的回答应明显能看出是基于用户的原始回答改进而来。直接输出优化后的内容，不要加额外说明。`,
    user: [
      `题目：${q.title}`,
      q.content ? `题目内容：${q.content}` : '',
      q.answerPoints.length ? `回答要点：\n${q.answerPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '',
      q.referenceAnswer ? `参考答案：\n${q.referenceAnswer}` : '',
      q.userAnswer ? `我的回答：\n${q.userAnswer}` : '',
    ].filter(Boolean).join('\n\n'),
  };
}

export function buildScorePrompt(q: InterviewQuestion): { system: string; user: string } {
  return {
    system: `你是面试评分专家。请根据题目、用户回答、回答要点和参考答案进行评分。
请严格按照以下 JSON 格式返回，不要输出任何其他内容：
{
  "dimensions": [
    {"name": "完整度", "score": 0-10},
    {"name": "逻辑性", "score": 0-10},
    {"name": "专业性", "score": 0-10},
    {"name": "表达清晰度", "score": 0-10}
  ],
  "totalScore": 0-40,
  "strengths": "优点描述",
  "weaknesses": "不足描述",
  "suggestions": "改进建议"
}`,
    user: [
      `题目：${q.title}`,
      q.content ? `题目内容：${q.content}` : '',
      q.answerPoints.length ? `回答要点：\n${q.answerPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : '',
      q.referenceAnswer ? `参考答案：\n${q.referenceAnswer}` : '',
      `我的回答：\n${q.userAnswer || '（未输入回答）'}`,
    ].filter(Boolean).join('\n\n'),
  };
}

// --- Parse AI score result, fallback to raw text ---

export function parseAiScoreResult(text: string): AiScoreResult {
  try {
    // Try to extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const obj = JSON.parse(jsonMatch[0]);
      if (obj.dimensions && typeof obj.totalScore === 'number') {
        return {
          dimensions: obj.dimensions.map((d: Record<string, unknown>) => ({
            name: String(d.name || ''),
            score: Math.max(0, Math.min(10, Number(d.score) || 0)),
          })),
          totalScore: obj.totalScore,
          strengths: String(obj.strengths || ''),
          weaknesses: String(obj.weaknesses || ''),
          suggestions: String(obj.suggestions || ''),
          rawText: text,
        };
      }
    }
  } catch { /* fall through */ }
  // Fallback: return raw text
  return {
    dimensions: [],
    totalScore: 0,
    strengths: '',
    weaknesses: '',
    suggestions: '',
    rawText: text,
  };
}
