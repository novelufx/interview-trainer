import type { MasteryStatus, Difficulty } from '../types/question';

interface StatusBadgeProps {
  type: 'mastery' | 'difficulty';
  value: MasteryStatus | Difficulty;
}

const masteryColors: Record<MasteryStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-600',
  '不熟': 'bg-red-100 text-red-700',
  '一般': 'bg-yellow-100 text-yellow-700',
  '已掌握': 'bg-green-100 text-green-700',
};

const difficultyColors: Record<Difficulty, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-yellow-100 text-yellow-700',
  '困难': 'bg-red-100 text-red-700',
};

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  const colorClass =
    type === 'mastery'
      ? masteryColors[value as MasteryStatus]
      : difficultyColors[value as Difficulty];

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {value}
    </span>
  );
}
