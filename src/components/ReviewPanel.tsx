import { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { InterviewQuestion, MasteryStatus } from '../types/question';

interface ReviewPanelProps {
  question: InterviewQuestion;
  onUpdate: (id: string, patch: Partial<InterviewQuestion>) => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getNextReviewSuggestion(mastery: MasteryStatus): string {
  const d = new Date();
  switch (mastery) {
    case '未开始':
    case '不熟':
      d.setDate(d.getDate() + 1);
      break;
    case '一般':
      d.setDate(d.getDate() + 3);
      break;
    case '已掌握':
      d.setDate(d.getDate() + 7);
      break;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReviewPanel({ question, onUpdate }: ReviewPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const today = todayStr();
  const nextReview = question.nextReviewAt;
  const isOverdue = nextReview && nextReview < today;
  const isToday = nextReview && nextReview === today;
  const isFuture = nextReview && nextReview > today;

  const handleSetDate = (dateStr: string) => {
    onUpdate(question.id, { nextReviewAt: dateStr || undefined });
  };

  const handleMarkReviewed = () => {
    const now = new Date().toISOString();
    const suggested = getNextReviewSuggestion(question.masteryStatus);
    onUpdate(question.id, {
      lastReviewedAt: now,
      reviewCount: (question.reviewCount || 0) + 1,
      nextReviewAt: suggested,
    });
  };

  // Status badge shown on collapsed header
  const statusBadge = isOverdue ? (
    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <Clock size={11} /> 已逾期
    </span>
  ) : isToday ? (
    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
      <Clock size={11} /> 今日待复习
    </span>
  ) : isFuture ? (
    <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
      <CalendarCheck size={11} /> {formatDate(nextReview!)}
    </span>
  ) : (
    <span className="text-xs text-gray-400">暂未设置</span>
  );

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-3 w-full text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
      >
        <CalendarCheck size={15} className="text-blue-600" />
        <span>复习计划</span>
        <span className="ml-1">{statusBadge}</span>
        {expanded ? <ChevronUp size={15} className="ml-auto" /> : <ChevronDown size={15} className="ml-auto" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Status indicators */}
          {isOverdue && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
              <Clock size={12} />
              已逾期 — 上次计划 {formatDate(nextReview!)}
            </div>
          )}
          {isToday && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
              <Clock size={12} />
              今日待复习
            </div>
          )}
          {isFuture && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <CalendarCheck size={12} />
              下次复习：{formatDate(nextReview!)}
            </div>
          )}

          {/* Set review date */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 flex-shrink-0">下次复习：</label>
            <input
              type="date"
              value={question.nextReviewAt ? question.nextReviewAt.slice(0, 10) : ''}
              onChange={(e) => handleSetDate(e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Mark reviewed */}
          <button
            onClick={handleMarkReviewed}
            className="flex items-center gap-1.5 w-full justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle size={14} />
            标记为已复习
          </button>

          {/* Review history */}
          {question.lastReviewedAt && (
            <div className="text-xs text-gray-400 space-y-0.5">
              <div>上次复习：{formatDate(question.lastReviewedAt)}</div>
              {question.reviewCount !== undefined && question.reviewCount > 0 && (
                <div>累计复习：{question.reviewCount} 次</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
