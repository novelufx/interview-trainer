import { useState, useRef } from 'react';
import {
  Sparkles,
  BarChart3,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCw,
} from 'lucide-react';
import type { InterviewQuestion, AiScoreResult } from '../types/question';
import { isAiConfigured, loadAiSettings, callChatCompletion, buildOptimizePrompt, buildScorePrompt, parseAiScoreResult } from '../utils/ai';

interface AiResultPanelProps {
  question: InterviewQuestion;
  onUpdate: (id: string, patch: Partial<InterviewQuestion>) => void;
}

export default function AiResultPanel({ question, onUpdate }: AiResultPanelProps) {
  const [aiLoading, setAiLoading] = useState<'optimize' | 'score' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showOptimized, setShowOptimized] = useState(!!question.aiOptimizedAnswer);
  const [showScore, setShowScore] = useState(!!question.aiScore);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const settings = loadAiSettings();
  const configured = isAiConfigured(settings);

  const handleOptimize = async () => {
    if (!question.userAnswer.trim()) {
      setAiError('请先输入你的回答，AI 才能帮你优化');
      return;
    }
    if (!configured) {
      setAiError('请先配置 AI 设置（侧边栏底部 → AI 设置）');
      return;
    }
    setAiError(null);
    setAiLoading('optimize');
    abortRef.current = new AbortController();
    try {
      const { system, user } = buildOptimizePrompt(question);
      const result = await callChatCompletion(settings, [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ], abortRef.current.signal);
      onUpdate(question.id, { aiOptimizedAnswer: result });
      setShowOptimized(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '请求失败';
      if (!msg.includes('abort')) setAiError(msg);
    } finally {
      setAiLoading(null);
    }
  };

  const handleScore = async () => {
    if (!question.userAnswer.trim()) {
      setAiError('请先输入你的回答，AI 才能帮你评分');
      return;
    }
    if (!configured) {
      setAiError('请先配置 AI 设置（侧边栏底部 → AI 设置）');
      return;
    }
    setAiError(null);
    setAiLoading('score');
    abortRef.current = new AbortController();
    try {
      const { system, user } = buildScorePrompt(question);
      const raw = await callChatCompletion(settings, [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ], abortRef.current.signal);
      const parsed = parseAiScoreResult(raw);
      onUpdate(question.id, { aiScore: parsed });
      setShowScore(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '请求失败';
      if (!msg.includes('abort')) setAiError(msg);
    } finally {
      setAiLoading(null);
    }
  };

  const handleCopyOptimized = () => {
    if (!question.aiOptimizedAnswer) return;
    navigator.clipboard.writeText(question.aiOptimizedAnswer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const score: AiScoreResult | undefined = question.aiScore;

  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleOptimize}
          disabled={!!aiLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50 transition-colors"
        >
          {aiLoading === 'optimize' ? (
            <RotateCw size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          {aiLoading === 'optimize' ? 'AI 正在分析...' : 'AI 优化回答'}
        </button>
        <button
          onClick={handleScore}
          disabled={!!aiLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {aiLoading === 'score' ? (
            <RotateCw size={15} className="animate-spin" />
          ) : (
            <BarChart3 size={15} />
          )}
          {aiLoading === 'score' ? 'AI 正在评分...' : 'AI 评分'}
        </button>
      </div>

      {/* Error */}
      {aiError && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 rounded-lg text-sm text-red-700 border border-red-100">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{aiError}</span>
        </div>
      )}

      {/* AI Optimized Answer */}
      {question.aiOptimizedAnswer && (
        <div>
          <button
            onClick={() => setShowOptimized(!showOptimized)}
            className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Sparkles size={15} />
            <span>AI 优化回答</span>
            <div className="ml-auto flex items-center gap-2">
              <span
                onClick={(e) => { e.stopPropagation(); handleCopyOptimized(); }}
                className="p-1 rounded hover:bg-purple-200 transition-colors"
                title="复制"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </span>
              {showOptimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>
          {showOptimized && (
            <div className="mt-2 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {question.aiOptimizedAnswer}
              </p>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => onUpdate(question.id, { aiOptimizedAnswer: undefined })}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  清除优化结果
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Score Result */}
      {score && (
        <div>
          <button
            onClick={() => setShowScore(!showScore)}
            className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <BarChart3 size={15} />
            <span>AI 评分结果</span>
            {score.totalScore > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-200 text-indigo-800">
                {score.totalScore}/40
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {showScore ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>
          {showScore && (
            <div className="mt-2 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3">
              {/* Dimensions */}
              {score.dimensions.length > 0 && (
                <div className="space-y-2">
                  {score.dimensions.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{d.name}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(d.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-6 text-right">{d.score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              {score.totalScore > 0 && (
                <div className="text-center py-2 border-t border-indigo-100">
                  <span className="text-2xl font-bold text-indigo-700">{score.totalScore}</span>
                  <span className="text-sm text-gray-400"> / 40</span>
                </div>
              )}

              {/* Strengths */}
              {score.strengths && (
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">优点</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{score.strengths}</p>
                </div>
              )}

              {/* Weaknesses */}
              {score.weaknesses && (
                <div>
                  <div className="text-xs font-medium text-yellow-600 mb-1">不足</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{score.weaknesses}</p>
                </div>
              )}

              {/* Suggestions */}
              {score.suggestions && (
                <div>
                  <div className="text-xs font-medium text-blue-600 mb-1">改进建议</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{score.suggestions}</p>
                </div>
              )}

              {/* Raw text fallback */}
              {!score.dimensions.length && score.rawText && (
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">AI 返回内容</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{score.rawText}</p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onUpdate(question.id, { aiScore: undefined })}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  清除评分
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
