import { useState, useEffect, useMemo, useCallback } from 'react';
import type { InterviewQuestion, MasteryStatus } from './types/question';
import type { QuestionFormData } from './components/AddQuestionModal';
import type { Stats } from './components/StatsPanel';
import { hasStoredData, loadQuestions, saveQuestions, loadSelectedId, saveSelectedId } from './utils/storage';
import { sampleQuestions } from './utils/sampleData';
import { exportMarkdown } from './utils/markdownExport';
import Sidebar from './components/Sidebar';
import QuestionPractice from './components/QuestionPractice';
import AddQuestionModal from './components/AddQuestionModal';
import BatchImportModal from './components/BatchImportModal';
import AiSettingsModal from './components/AiSettingsModal';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部题目');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [masteryFilter, setMasteryFilter] = useState('全部状态');
  const [difficultyFilter, setDifficultyFilter] = useState('全部难度');
  const [quickWeakFilter, setQuickWeakFilter] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (hasStoredData()) {
      const stored = loadQuestions();
      setQuestions(stored);
      if (stored.length > 0) {
        const savedId = loadSelectedId();
        if (savedId && stored.some((q) => q.id === savedId)) {
          setSelectedId(savedId);
        } else {
          setSelectedId(stored[0].id);
        }
      } else {
        setSelectedId(null);
      }
    } else {
      setQuestions(sampleQuestions);
      setSelectedId(sampleQuestions[0].id);
      saveQuestions(sampleQuestions);
      saveSelectedId(sampleQuestions[0].id);
    }
    setHydrated(true);
  }, []);

  // Persist questions
  useEffect(() => {
    if (!hydrated) return;
    saveQuestions(questions);
  }, [questions, hydrated]);

  // Persist selected id
  useEffect(() => {
    saveSelectedId(selectedId);
  }, [selectedId]);

  // Auto-extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.category));
    return Array.from(set).sort();
  }, [questions]);

  const totalCount = questions.length;
  const totalFavoritesCount = useMemo(
    () => questions.filter((q) => q.favorite).length,
    [questions]
  );

  // Review counts
  const today = todayStr();
  const todayReviewCount = useMemo(
    () => questions.filter((q) => q.nextReviewAt && q.nextReviewAt <= today).length,
    [questions, today]
  );
  const overdueReviewCount = useMemo(
    () => questions.filter((q) => q.nextReviewAt && q.nextReviewAt < today).length,
    [questions, today]
  );

  // Stats
  const stats: Stats = useMemo(() => ({
    total: questions.length,
    favorites: questions.filter((q) => q.favorite).length,
    notStarted: questions.filter((q) => q.masteryStatus === '未开始').length,
    unfamiliar: questions.filter((q) => q.masteryStatus === '不熟').length,
    familiar: questions.filter((q) => q.masteryStatus === '一般').length,
    mastered: questions.filter((q) => q.masteryStatus === '已掌握').length,
    todayReview: todayReviewCount,
    overdueReview: overdueReviewCount,
  }), [questions, todayReviewCount, overdueReviewCount]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let result = questions;

    // 1. Category / review / favorites filter
    if (selectedCategory === '我的收藏') {
      result = result.filter((q) => q.favorite);
    } else if (selectedCategory === '今日待复习') {
      result = result.filter((q) => q.nextReviewAt && q.nextReviewAt <= today);
    } else if (selectedCategory === '已逾期') {
      result = result.filter((q) => q.nextReviewAt && q.nextReviewAt < today);
    } else if (selectedCategory === '全部复习计划') {
      result = result.filter((q) => !!q.nextReviewAt);
    } else if (selectedCategory !== '全部题目') {
      result = result.filter((q) => q.category === selectedCategory);
    }

    // 2. Search
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.content.toLowerCase().includes(query) ||
          q.category.toLowerCase().includes(query) ||
          q.tags.some((t) => t.toLowerCase().includes(query)) ||
          q.referenceAnswer.toLowerCase().includes(query)
      );
    }

    // 3. Mastery filter
    if (masteryFilter !== '全部状态') {
      result = result.filter((q) => q.masteryStatus === masteryFilter);
    }

    // 4. Difficulty filter
    if (difficultyFilter !== '全部难度') {
      result = result.filter((q) => q.difficulty === difficultyFilter);
    }

    // 5. Quick weak
    if (quickWeakFilter) {
      result = result.filter((q) => q.masteryStatus === '未开始' || q.masteryStatus === '不熟');
    }

    return result;
  }, [questions, selectedCategory, searchQuery, masteryFilter, difficultyFilter, quickWeakFilter, today]);

  // Auto-select
  useEffect(() => {
    if (filteredQuestions.length > 0 && selectedId && !filteredQuestions.some((q) => q.id === selectedId)) {
      setSelectedId(filteredQuestions[0].id);
    }
  }, [filteredQuestions, selectedId]);

  const selectedQuestion = useMemo(
    () => filteredQuestions.find((q) => q.id === selectedId) || null,
    [filteredQuestions, selectedId]
  );

  const currentIndex = useMemo(
    () => filteredQuestions.findIndex((q) => q.id === selectedId),
    [filteredQuestions, selectedId]
  );

  const handleSelectQuestion = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleAddQuestion = useCallback(
    (data: QuestionFormData) => {
      const now = new Date().toISOString();
      const newQ: InterviewQuestion = {
        id: `q-${Date.now()}`,
        ...data,
        userAnswer: '',
        favorite: false,
        masteryStatus: '未开始',
        createdAt: now,
        updatedAt: now,
      };
      setQuestions((prev) => [...prev, newQ]);
      setSelectedId(newQ.id);
      setShowAddModal(false);
    },
    []
  );

  const handleEditQuestion = useCallback(
    (data: QuestionFormData) => {
      if (!editingQuestion) return;
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? { ...q, ...data, updatedAt: new Date().toISOString() }
            : q
        )
      );
      setEditingQuestion(null);
    },
    [editingQuestion]
  );

  const handleUpdateUserAnswer = useCallback((id: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, userAnswer: answer, updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  const handleClearAnswer = useCallback((id: string) => {
    if (!window.confirm('确定要清空当前回答吗？')) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, userAnswer: '', updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, favorite: !q.favorite, updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  const handleUpdateMastery = useCallback((id: string, status: MasteryStatus) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, masteryStatus: status, updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  // V3: generic question patch handler
  const handleUpdateQuestion = useCallback((id: string, patch: Partial<InterviewQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('确定要删除这道题目吗？')) return;
      const remaining = questions.filter((q) => q.id !== id);
      setQuestions(remaining);
      if (remaining.length === 0) {
        setSelectedId(null);
      } else if (selectedId === id) {
        const idx = questions.findIndex((q) => q.id === id);
        const nextIdx = Math.min(idx, remaining.length - 1);
        setSelectedId(remaining[nextIdx].id);
      }
    },
    [questions, selectedId]
  );

  const handleReset = useCallback(() => {
    if (!window.confirm('确定要清空当前所有题目，并恢复示例数据吗？此操作不可撤销。')) return;
    setQuestions(sampleQuestions);
    setSelectedId(sampleQuestions[0].id);
    setSelectedCategory('全部题目');
    setSearchQuery('');
    setMasteryFilter('全部状态');
    setDifficultyFilter('全部难度');
    setQuickWeakFilter(false);
    saveQuestions(sampleQuestions);
    saveSelectedId(sampleQuestions[0].id);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedId(filteredQuestions[currentIndex - 1].id);
    }
  }, [currentIndex, filteredQuestions]);

  const handleNext = useCallback(() => {
    if (currentIndex < filteredQuestions.length - 1) {
      setSelectedId(filteredQuestions[currentIndex + 1].id);
    }
  }, [currentIndex, filteredQuestions]);

  const handleRandom = useCallback(() => {
    if (filteredQuestions.length <= 1) return;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * filteredQuestions.length);
    } while (filteredQuestions[idx].id === selectedId && filteredQuestions.length > 1);
    setSelectedId(filteredQuestions[idx].id);
  }, [filteredQuestions, selectedId]);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  }, []);

  const handleBatchImport = useCallback(
    (parsedData: QuestionFormData[]) => {
      const now = new Date().toISOString();
      const newQuestions: InterviewQuestion[] = parsedData.map((d, i) => ({
        id: `q-${Date.now()}-${i}`,
        ...d,
        userAnswer: '',
        favorite: false,
        masteryStatus: '未开始' as MasteryStatus,
        createdAt: now,
        updatedAt: now,
      }));
      setQuestions((prev) => [...prev, ...newQuestions]);
      if (newQuestions.length > 0) {
        setSelectedId(newQuestions[0].id);
      }
    },
    []
  );

  const handleExport = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '3.2.0',
      questions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `interview-trainer-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [questions]);

  const handleImportBackup = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!Array.isArray(data.questions)) {
            alert('备份文件格式不正确');
            return;
          }
          if (!window.confirm('导入备份会覆盖当前题库，确定继续吗？')) return;
          setQuestions(data.questions);
          if (data.questions.length > 0) {
            setSelectedId(data.questions[0].id);
          } else {
            setSelectedId(null);
          }
          setSelectedCategory('全部题目');
          setSearchQuery('');
          setMasteryFilter('全部状态');
          setDifficultyFilter('全部难度');
          setQuickWeakFilter(false);
        } catch {
          alert('备份文件格式不正确');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleToggleQuickWeak = useCallback(() => {
    setQuickWeakFilter((prev) => !prev);
  }, []);

  // V3: Markdown export
  const handleExportMarkdown = useCallback(
    (filtered: boolean) => {
      const data = filtered ? filteredQuestions : questions;
      exportMarkdown(data);
    },
    [questions, filteredQuestions]
  );

  // V3: Print / PDF
  const handlePrintPdf = useCallback(() => {
    const data = filteredQuestions;
    if (data.length === 0) {
      alert('当前没有可导出的题目');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('无法打开打印窗口，请检查弹窗拦截设置');
      return;
    }
    const html = buildPrintHtml(data);
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [filteredQuestions]);

  const editInitialData: QuestionFormData | undefined = editingQuestion
    ? {
        title: editingQuestion.title,
        content: editingQuestion.content,
        category: editingQuestion.category,
        difficulty: editingQuestion.difficulty,
        tags: editingQuestion.tags,
        answerPoints: editingQuestion.answerPoints,
        referenceAnswer: editingQuestion.referenceAnswer,
      }
    : undefined;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Sidebar
          questions={filteredQuestions}
          totalCount={totalCount}
          totalFavoritesCount={totalFavoritesCount}
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          selectedId={selectedId}
          masteryFilter={masteryFilter}
          difficultyFilter={difficultyFilter}
          quickWeakFilter={quickWeakFilter}
          stats={stats}
          onSelectCategory={handleSelectCategory}
          onSearch={setSearchQuery}
          onSelectQuestion={handleSelectQuestion}
          onAddClick={() => setShowAddModal(true)}
          onBatchImportClick={() => setShowBatchImportModal(true)}
          onExport={handleExport}
          onImportBackup={handleImportBackup}
          onReset={handleReset}
          onMasteryFilterChange={setMasteryFilter}
          onDifficultyFilterChange={setDifficultyFilter}
          onQuickWeakToggle={handleToggleQuickWeak}
          onAiSettingsClick={() => setShowAiSettingsModal(true)}
          onExportMarkdown={handleExportMarkdown}
          onPrintPdf={handlePrintPdf}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto p-8">
          <QuestionPractice
            key={selectedId}
            question={selectedQuestion}
            currentIndex={currentIndex >= 0 ? currentIndex : 0}
            totalCount={filteredQuestions.length}
            allCount={questions.length}
            onUpdateUserAnswer={handleUpdateUserAnswer}
            onClearAnswer={handleClearAnswer}
            onToggleFavorite={handleToggleFavorite}
            onUpdateMastery={handleUpdateMastery}
            onEdit={(q) => setEditingQuestion(q)}
            onDelete={handleDelete}
            onPrev={handlePrev}
            onNext={handleNext}
            onRandom={handleRandom}
            onAddClick={() => setShowAddModal(true)}
            onUpdateQuestion={handleUpdateQuestion}
          />
        </div>
      </div>

      {/* Modals */}
      <AddQuestionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddQuestion}
        categories={categories}
      />
      <AddQuestionModal
        isOpen={editingQuestion !== null}
        onClose={() => setEditingQuestion(null)}
        onAdd={handleEditQuestion}
        categories={categories}
        initialData={editInitialData}
      />
      <BatchImportModal
        isOpen={showBatchImportModal}
        onClose={() => setShowBatchImportModal(false)}
        onImport={handleBatchImport}
      />
      <AiSettingsModal
        isOpen={showAiSettingsModal}
        onClose={() => setShowAiSettingsModal(false)}
      />
    </div>
  );
}

// --- Print HTML builder ---
function buildPrintHtml(questions: InterviewQuestion[]): string {
  let body = '';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    body += `<div style="margin-bottom:32px;page-break-inside:avoid;">
      <h2 style="font-size:16px;margin:0 0 8px;">${i + 1}. ${q.title}</h2>
      <p style="color:#666;font-size:13px;margin:0 0 8px;">${q.category} · ${q.difficulty} · ${q.masteryStatus}</p>
      ${q.content ? `<div style="background:#f5f5f5;padding:12px;border-radius:6px;margin-bottom:12px;font-size:14px;white-space:pre-wrap;">${q.content}</div>` : ''}
      ${q.userAnswer ? `<h3 style="font-size:13px;margin:0 0 4px;">我的回答</h3><div style="font-size:14px;border:1px solid #e5e7eb;padding:12px;border-radius:6px;white-space:pre-wrap;margin-bottom:12px;">${q.userAnswer}</div>` : ''}
      ${q.answerPoints.length ? `<h3 style="font-size:13px;margin:0 0 4px;">回答要点</h3><ul style="font-size:14px;margin:0 0 12px 20px;">${q.answerPoints.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
      ${q.referenceAnswer ? `<h3 style="font-size:13px;margin:0 0 4px;">参考答案</h3><div style="font-size:14px;background:#f0f9ff;padding:12px;border-radius:6px;white-space:pre-wrap;margin-bottom:12px;">${q.referenceAnswer}</div>` : ''}
      ${q.aiOptimizedAnswer ? `<h3 style="font-size:13px;margin:0 0 4px;">AI 优化回答</h3><div style="font-size:14px;background:#faf5ff;padding:12px;border-radius:6px;white-space:pre-wrap;margin-bottom:12px;">${q.aiOptimizedAnswer}</div>` : ''}
    </div>`;
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>面试题导出</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif;padding:24px;max-width:800px;margin:0 auto;}@media print{body{padding:0;}}</style></head><body>${body}</body></html>`;
}
