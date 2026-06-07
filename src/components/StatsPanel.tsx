import { BarChart3 } from 'lucide-react';

export interface Stats {
  total: number;
  favorites: number;
  notStarted: number;
  unfamiliar: number;
  familiar: number;
  mastered: number;
  todayReview: number;
  overdueReview: number;
}

interface StatsPanelProps {
  stats: Stats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart3 size={13} className="text-gray-400" />
        <span className="text-xs text-gray-400">统计</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <StatItem label="总题数" value={stats.total} color="text-gray-700" />
        <StatItem label="收藏" value={stats.favorites} color="text-yellow-600" />
        <StatItem label="已掌握" value={stats.mastered} color="text-green-600" />
        <StatItem label="未开始" value={stats.notStarted} color="text-gray-400" />
        <StatItem label="不熟" value={stats.unfamiliar} color="text-red-500" />
        <StatItem label="一般" value={stats.familiar} color="text-yellow-500" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-1.5">
        <StatItem label="今日待复习" value={stats.todayReview} color="text-orange-600" />
        <StatItem label="已逾期" value={stats.overdueReview} color="text-red-500" />
      </div>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-md px-2 py-1.5">
      <span className="text-[11px] text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{value}</span>
    </div>
  );
}
