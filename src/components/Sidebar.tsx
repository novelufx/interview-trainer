import {
  Search,
  Star,
  FolderOpen,
  Plus,
  Layers,
  RotateCcw,
  Upload,
  Download,
  FileUp,
  Zap,
  CalendarClock,
  AlertTriangle,
  CalendarCheck,
  Settings2,
  FileText,
  Printer,
} from 'lucide-react';
import QuestionList from './QuestionList';
import StatsPanel from './StatsPanel';
import type { Stats } from './StatsPanel';
import type { InterviewQuestion } from '../types/question';
import { MASTERY_OPTIONS, DIFFICULTY_OPTIONS } from '../types/question';

interface SidebarProps {
  questions: InterviewQuestion[];
  totalCount: number;
  totalFavoritesCount: number;
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  selectedId: string | null;
  masteryFilter: string;
  difficultyFilter: string;
  quickWeakFilter: boolean;
  stats: Stats;
  onSelectCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onSelectQuestion: (id: string) => void;
  onAddClick: () => void;
  onBatchImportClick: () => void;
  onExport: () => void;
  onImportBackup: () => void;
  onReset: () => void;
  onMasteryFilterChange: (value: string) => void;
  onDifficultyFilterChange: (value: string) => void;
  onQuickWeakToggle: () => void;
  onAiSettingsClick: () => void;
  onExportMarkdown: (filtered: boolean) => void;
  onPrintPdf: () => void;
}

export default function Sidebar({
  questions,
  totalCount,
  totalFavoritesCount,
  categories,
  selectedCategory,
  searchQuery,
  selectedId,
  masteryFilter,
  difficultyFilter,
  quickWeakFilter,
  stats,
  onSelectCategory,
  onSearch,
  onSelectQuestion,
  onAddClick,
  onBatchImportClick,
  onExport,
  onImportBackup,
  onReset,
  onMasteryFilterChange,
  onDifficultyFilterChange,
  onQuickWeakToggle,
  onAiSettingsClick,
  onExportMarkdown,
  onPrintPdf,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Search */}
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="搜索题目..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-100">
        <StatsPanel stats={stats} />
      </div>

      {/* Categories */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => onSelectCategory('全部题目')}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === '全部题目'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Layers size={15} />
          <span>全部题目</span>
          <span className="ml-auto text-xs text-gray-400">{totalCount}</span>
        </button>

        <button
          onClick={() => onSelectCategory('我的收藏')}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedCategory === '我的收藏'
              ? 'bg-yellow-50 text-yellow-700 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star size={15} />
          <span>我的收藏</span>
          <span className="ml-auto text-xs text-gray-400">
            {totalFavoritesCount}
          </span>
        </button>

        {/* Review filters */}
        <div className="mt-2 border-t border-gray-100 pt-2">
          <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider">复习</div>
          <button
            onClick={() => onSelectCategory('今日待复习')}
            className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === '今日待复习'
                ? 'bg-orange-50 text-orange-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarClock size={14} />
            <span>今日待复习</span>
            {stats.todayReview > 0 && (
              <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                {stats.todayReview}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectCategory('已逾期')}
            className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === '已逾期'
                ? 'bg-red-50 text-red-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle size={14} />
            <span>已逾期</span>
            {stats.overdueReview > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                {stats.overdueReview}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectCategory('全部复习计划')}
            className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === '全部复习计划'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CalendarCheck size={14} />
            <span>全部复习计划</span>
          </button>
        </div>

        {categories.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-2">
            <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider">分类</div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen size={14} />
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-3 pt-2 pb-1 border-t border-gray-100">
        <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider mb-1">筛选</div>
        <div className="flex gap-2 mb-2">
          <select
            value={masteryFilter}
            onChange={(e) => onMasteryFilterChange(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="全部状态">全部状态</option>
            {MASTERY_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyFilterChange(e.target.value)}
            className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="全部难度">全部难度</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onQuickWeakToggle}
          className={`flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs transition-colors ${
            quickWeakFilter
              ? 'bg-orange-100 text-orange-700 font-medium'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Zap size={13} />
          <span>只练不熟题</span>
        </button>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
          题目列表
          {questions.length !== totalCount && (
            <span className="ml-1">({questions.length})</span>
          )}
        </div>
        <QuestionList
          questions={questions}
          selectedId={selectedId}
          onSelect={onSelectQuestion}
        />
      </div>

      {/* Data Management */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          添加题目
        </button>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          <button
            onClick={onBatchImportClick}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload size={12} />
            批量导入
          </button>
          <button
            onClick={() => onExportMarkdown(false)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            title="导出全部题目为 Markdown"
          >
            <FileText size={12} />
            MD 导出
          </button>
          <button
            onClick={() => onExportMarkdown(true)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            title="导出当前筛选结果为 Markdown"
          >
            <FileText size={12} />
            MD 当前
          </button>
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={12} />
            导出数据
          </button>
          <button
            onClick={onImportBackup}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileUp size={12} />
            导入备份
          </button>
          <button
            onClick={onPrintPdf}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
            title="打印 / 另存为 PDF"
          >
            <Printer size={12} />
            PDF
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={12} />
            重置数据
          </button>
          <button
            onClick={onAiSettingsClick}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings2 size={12} />
            AI 设置
          </button>
        </div>
      </div>
    </div>
  );
}
