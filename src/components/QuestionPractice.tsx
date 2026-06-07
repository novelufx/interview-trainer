import {
  Star,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Shuffle,
} from 'lucide-react';
import type { InterviewQuestion, MasteryStatus } from '../types/question';
import { MASTERY_OPTIONS } from '../types/question';
import StatusBadge from './StatusBadge';
import AnswerPanel from './AnswerPanel';
import EmptyState from './EmptyState';
import AiResultPanel from './AiResultPanel';
import ReviewPanel from './ReviewPanel';

interface QuestionPracticeProps {
  question: InterviewQuestion | null;
  currentIndex: number;
  totalCount: number;
  allCount: number;
  onUpdateUserAnswer: (id: string, answer: string) => void;
  onClearAnswer: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateMastery: (id: string, status: MasteryStatus) => void;
  onEdit: (question: InterviewQuestion) => void;
  onDelete: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  onAddClick: () => void;
  onUpdateQuestion: (id: string, patch: Partial<InterviewQuestion>) => void;
}

export default function QuestionPractice({
  question,
  currentIndex,
  totalCount,
  allCount,
  onUpdateUserAnswer,
  onClearAnswer,
  onToggleFavorite,
  onUpdateMastery,
  onEdit,
  onDelete,
  onPrev,
  onNext,
  onRandom,
  onAddClick,
  onUpdateQuestion,
}: QuestionPracticeProps) {
  if (!question) {
    return (
      <EmptyState
        message={allCount === 0 ? '还没有面试题，点击添加题目开始创建' : '没有找到相关题目'}
        actionLabel={allCount === 0 ? '添加题目' : undefined}
        onAction={allCount === 0 ? onAddClick : undefined}
      />
    );
  }

  const charCount = question.userAnswer.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{question.title}</h1>
            <button
              onClick={() => onToggleFavorite(question.id)}
              className="p-1 rounded hover:bg-yellow-50 transition-colors"
              title={question.favorite ? '取消收藏' : '收藏'}
            >
              <Star
                size={20}
                className={question.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge type="difficulty" value={question.difficulty} />
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {question.category}
            </span>
            {question.tags.map((tag) => (
              <span key={tag} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">掌握：</span>
            <select
              value={question.masteryStatus}
              onChange={(e) => onUpdateMastery(question.id, e.target.value as MasteryStatus)}
              className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MASTERY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onEdit(question)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="编辑题目"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除题目"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {question.content && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {question.content}
          </p>
        </div>
      )}

      {/* User Answer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            你的回答
          </label>
          {charCount > 0 && (
            <button
              onClick={() => onClearAnswer(question.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="清空回答"
            >
              <Eraser size={13} />
              清空回答
            </button>
          )}
        </div>
        <textarea
          value={question.userAnswer}
          onChange={(e) => onUpdateUserAnswer(question.id, e.target.value)}
          placeholder="请输入你的回答..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="text-xs text-gray-400 mt-1 text-right">
          当前回答：{charCount} 字
        </div>
      </div>

      {/* AI Result Panel */}
      <AiResultPanel question={question} onUpdate={onUpdateQuestion} />

      {/* Answer Panel */}
      <AnswerPanel question={question} />

      {/* Review Panel */}
      <div className="mt-4">
        <ReviewPanel question={question} onUpdate={onUpdateQuestion} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-auto pt-6">
        <button
          onClick={onPrev}
          disabled={currentIndex <= 0}
          className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          上一题
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onRandom}
            disabled={totalCount <= 1}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="随机一题"
          >
            <Shuffle size={15} />
            随机
          </button>
          <span className="text-sm text-gray-400">
            {currentIndex + 1} / {totalCount}
          </span>
        </div>
        <button
          onClick={onNext}
          disabled={currentIndex >= totalCount - 1}
          className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          下一题
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
