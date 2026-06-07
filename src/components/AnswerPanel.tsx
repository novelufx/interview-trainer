import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, BookOpen } from 'lucide-react';
import type { InterviewQuestion } from '../types/question';

interface AnswerPanelProps {
  question: InterviewQuestion;
}

export default function AnswerPanel({ question }: AnswerPanelProps) {
  const [showPoints, setShowPoints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowPoints(!showPoints)}
        className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <ListChecks size={16} />
        <span>查看回答要点</span>
        {showPoints ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
      </button>

      {showPoints && question.answerPoints.length > 0 && (
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
          <ul className="space-y-2">
            {question.answerPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs font-medium flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showPoints && question.answerPoints.length === 0 && (
        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100 text-sm text-gray-400">
          暂无回答要点
        </div>
      )}

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="flex items-center gap-2 px-4 py-2.5 w-full text-left text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
      >
        <BookOpen size={16} />
        <span>查看参考答案</span>
        {showAnswer ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
      </button>

      {showAnswer && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {question.referenceAnswer ? (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {question.referenceAnswer}
            </p>
          ) : (
            <p className="text-sm text-gray-400">暂无参考答案</p>
          )}
        </div>
      )}
    </div>
  );
}
