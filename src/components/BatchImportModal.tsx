import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import type { Difficulty } from '../types/question';
import type { QuestionFormData } from './AddQuestionModal';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: QuestionFormData[]) => void;
}

const EXAMPLE_TEXT = `## 什么是闭包？
分类：JavaScript
难度：简单
标签：JavaScript, 闭包, 作用域
回答要点：
- 函数可以访问外部作用域变量
- 外层函数执行结束后变量仍可能被内部函数引用
- 常用于数据私有化和状态保存
参考答案：
闭包是指函数可以访问其词法作用域中的变量，即使函数在其词法作用域之外执行。

## Vue 中 computed 和 watch 的区别？
分类：Vue
难度：中等
标签：Vue, computed, watch
回答要点：
- computed 适合派生计算值
- computed 有缓存
- watch 适合监听变化并执行副作用
参考答案：
computed 和 watch 都基于响应式系统，但 computed 更适合声明式计算值，watch 更适合处理异步请求、复杂逻辑或副作用。`;

/**
 * Parse question text. Supports two formats:
 * 1) Markdown style: ## Title lines
 * 2) Structured style: questions separated by blank lines,
 *    each with fields like 分类/难度/标签/回答要点/参考答案
 */
function parseMarkdown(text: string): QuestionFormData[] {
  // Try ## -style first
  if (/^## /m.test(text)) {
    return parseHashStyle(text);
  }
  return parseStructuredStyle(text);
}

function parseHashStyle(text: string): QuestionFormData[] {
  const blocks = text.split(/^## /gm).filter(Boolean);
  const results: QuestionFormData[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const title = lines[0]?.trim();
    if (!title) continue;

    let category = '未分类';
    let difficulty: Difficulty = '中等';
    let tags: string[] = [];
    let answerPoints: string[] = [];
    let referenceAnswer = '';
    let section: 'none' | 'points' | 'answer' = 'none';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('分类：') || trimmed.startsWith('分类:')) {
        category = trimmed.replace(/^分类[：:]/, '').trim() || '未分类';
        section = 'none';
      } else if (trimmed.startsWith('难度：') || trimmed.startsWith('难度:')) {
        const d = trimmed.replace(/^难度[：:]/, '').trim();
        if (d === '简单' || d === '中等' || d === '困难') difficulty = d;
        section = 'none';
      } else if (trimmed.startsWith('标签：') || trimmed.startsWith('标签:')) {
        tags = trimmed.replace(/^标签[：:]/, '').split(/[,，]/).map((t) => t.trim()).filter(Boolean);
        section = 'none';
      } else if (trimmed === '回答要点：' || trimmed === '回答要点:') {
        section = 'points';
      } else if (trimmed === '参考答案：' || trimmed === '参考答案:') {
        section = 'answer';
      } else if (section === 'points' && (trimmed.startsWith('- ') || trimmed.startsWith('· '))) {
        answerPoints.push(trimmed.slice(2).trim());
      } else if (section === 'points' && trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('·')) {
        // Non-bulleted line in points section: treat as a point without bullet
        answerPoints.push(trimmed);
      } else if (section === 'answer') {
        referenceAnswer = referenceAnswer ? referenceAnswer + '\n' + trimmed : trimmed;
      }
    }

    results.push({ title, content: '', category, difficulty, tags, answerPoints, referenceAnswer: referenceAnswer.trim() });
  }
  return results;
}

const FIELD_PATTERN = /^(分类|难度|标签|回答要点|参考答案)[：:]/;

function parseStructuredStyle(text: string): QuestionFormData[] {
  // Split into question blocks by blank lines
  const rawBlocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const results: QuestionFormData[] = [];

  for (const block of rawBlocks) {
    const lines = block.split('\n');
    // Find the title: first non-empty line that is not a field line
    let titleIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !FIELD_PATTERN.test(trimmed)) {
        titleIdx = i;
        break;
      }
    }
    if (titleIdx === -1) continue;
    const title = lines[titleIdx].trim();

    let category = '未分类';
    let difficulty: Difficulty = '中等';
    let tags: string[] = [];
    let answerPoints: string[] = [];
    let referenceAnswer = '';
    let section: 'none' | 'points' | 'answer' = 'none';

    for (let i = titleIdx + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (trimmed.startsWith('分类：') || trimmed.startsWith('分类:')) {
        category = trimmed.replace(/^分类[：:]/, '').trim() || '未分类';
        section = 'none';
      } else if (trimmed.startsWith('难度：') || trimmed.startsWith('难度:')) {
        const d = trimmed.replace(/^难度[：:]/, '').trim();
        if (d === '简单' || d === '中等' || d === '困难') difficulty = d;
        section = 'none';
      } else if (trimmed.startsWith('标签：') || trimmed.startsWith('标签:')) {
        tags = trimmed.replace(/^标签[：:]/, '').split(/[,，]/).map((t) => t.trim()).filter(Boolean);
        section = 'none';
      } else if (trimmed === '回答要点：' || trimmed === '回答要点:') {
        section = 'points';
      } else if (trimmed === '参考答案：' || trimmed === '参考答案:') {
        section = 'answer';
      } else if (section === 'points' && (trimmed.startsWith('- ') || trimmed.startsWith('· '))) {
        answerPoints.push(trimmed.slice(2).trim());
      } else if (section === 'points' && trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('·')) {
        answerPoints.push(trimmed);
      } else if (section === 'answer') {
        referenceAnswer = referenceAnswer ? referenceAnswer + '\n' + trimmed : trimmed;
      }
    }

    results.push({ title, content: '', category, difficulty, tags, answerPoints, referenceAnswer: referenceAnswer.trim() });
  }
  return results;
}

export default function BatchImportModal({ isOpen, onClose, onImport }: BatchImportModalProps) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShowExample = () => {
    setText(EXAMPLE_TEXT);
    setFeedback(null);
  };

  const handleImport = () => {
    const parsed = parseMarkdown(text);
    if (parsed.length === 0) {
      setFeedback('没有识别到可导入的题目');
      return;
    }
    onImport(parsed);
    setFeedback(`成功导入 ${parsed.length} 道题`);
    setText('');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setText('');
    setFeedback(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">批量导入题目</h2>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="text-sm text-gray-500 space-y-1">
            <p>直接粘贴题目文本即可，题目之间用<strong>空行</strong>分隔。每道题首行为标题，后续行识别分类、难度、标签、回答要点、参考答案。</p>
            <p>也支持 <code className="bg-gray-100 px-1 rounded">## 标题</code> 格式。</p>
          </div>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFeedback(null); }}
            placeholder={`题目标题\n分类：分类名\n难度：简单\n标签：标签1, 标签2\n回答要点：\n- 要点一\n- 要点二\n参考答案：\n参考答案内容...\n\n第二道题标题\n分类：...\n难度：...\n...`}
            rows={16}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          {feedback && (
            <div className={`text-sm px-3 py-2 rounded-lg ${feedback.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-gray-100">
          <button type="button" onClick={handleShowExample} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <FileText size={14} /> 填入示例格式
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">取消</button>
            <button onClick={handleImport} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">导入</button>
          </div>
        </div>
      </div>
    </div>
  );
}
