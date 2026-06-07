import type { InterviewQuestion } from '../types/question';
import { Star, BookOpen } from 'lucide-react';

interface QuestionListProps {
  questions: InterviewQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const masteryDotColors: Record<string, string> = {
  '未开始': 'bg-gray-300',
  '不熟': 'bg-red-400',
  '一般': 'bg-yellow-400',
  '已掌握': 'bg-green-400',
};

export default function QuestionList({ questions, selectedId, onSelect }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <BookOpen size={24} className="mx-auto mb-2 opacity-40" />
        没有找到相关题目
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {questions.map((q) => (
        <div
          key={q.id}
          onClick={() => onSelect(q.id)}
          className={`flex items-center gap-2 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors
            ${selectedId === q.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${masteryDotColors[q.masteryStatus] || 'bg-gray-300'}`}
            title={q.masteryStatus}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {q.title}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <span>{q.category}</span>
              <span>·</span>
              <span>{q.difficulty}</span>
            </div>
          </div>
          {q.favorite && (
            <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
