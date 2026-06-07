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

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

// Allow optional spaces before the colon: "分类：" "分类:" "分类 ：" "分类 :"
const FIELD_RE = /^(分类|难度|标签|回答要点|参考答案)\s*[：:]/;

/** Check if a trimmed line is a field header (分类/难度/标签/回答要点/参考答案) */
function isFieldLine(line: string): boolean {
  return FIELD_RE.test(line);
}

/** Match a specific field name, returns the value after the colon or null */
function matchFieldValue(line: string, fieldName: string): string | null {
  const m = line.match(new RegExp(`^${fieldName}\\s*[：:]\\s*(.*)`));
  return m ? m[1] : null;
}

/** Check if a line is a field header with no inline value (e.g. "回答要点：" or "参考答案 ：") */
function isFieldHeaderOnly(line: string, fieldName: string): boolean {
  return new RegExp(`^${fieldName}\\s*[：:]\\s*$`).test(line);
}

/**
 * Detect question boundaries by scanning all lines.
 * A new question starts at line i when:
 *   - line i starts with "## " (hash-style), OR
 *   - line i is non-empty, not a field line, not blank,
 *     and the NEXT non-empty line is a field line starting with 分类：
 */
function findQuestionRanges(lines: string[]): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  const len = lines.length;

  // Pass 1: collect indices of non-empty lines
  const nonEmpty: number[] = [];
  for (let i = 0; i < len; i++) {
    if (lines[i].trim()) nonEmpty.push(i);
  }

  for (let k = 0; k < nonEmpty.length; k++) {
    const i = nonEmpty[k];
    const trimmed = lines[i].trim();

    // Hash-style: always a new question
    if (trimmed.startsWith('## ')) {
      ranges.push({ start: i, end: -1 });
      continue;
    }

    // Not a field line, and the next non-empty line starts with 分类：
    if (!isFieldLine(trimmed)) {
      if (k + 1 < nonEmpty.length) {
        const nextTrimmed = lines[nonEmpty[k + 1]].trim();
        if (isFieldLine(nextTrimmed) && !/^参考答案\s*[：:]/.test(nextTrimmed)) {
          ranges.push({ start: i, end: -1 });
          continue;
        }
      }
    }
  }

  // Set end boundaries
  for (let r = 0; r < ranges.length; r++) {
    ranges[r].end = r + 1 < ranges.length ? ranges[r + 1].start : len;
  }

  return ranges;
}

/** Parse a single question block given its line range */
function parseQuestionBlock(
  lines: string[],
  start: number,
  end: number,
): QuestionFormData | null {
  // Extract raw text lines for this question
  const block = lines.slice(start, end);

  let title = '';
  let category = '未分类';
  let difficulty: Difficulty = '中等';
  let tags: string[] = [];
  let answerPoints: string[] = [];
  let referenceAnswer = '';
  let section: 'none' | 'points' | 'answer' = 'none';

  // Find title line
  let titleIdx = -1;
  for (let i = 0; i < block.length; i++) {
    const trimmed = block[i].trim();
    if (!trimmed) continue;
    // Strip ## prefix if present
    if (trimmed.startsWith('## ')) {
      title = trimmed.slice(3).trim();
      titleIdx = i;
      break;
    }
    if (!isFieldLine(trimmed)) {
      title = trimmed;
      titleIdx = i;
      break;
    }
  }

  if (!title) return null;

  // Parse fields after title
  for (let i = titleIdx + 1; i < block.length; i++) {
    const trimmed = block[i].trim();

    const catVal = matchFieldValue(trimmed, '分类');
    if (catVal !== null) {
      category = catVal.trim() || '未分类';
      section = 'none';
    } else {
      const diffVal = matchFieldValue(trimmed, '难度');
      if (diffVal !== null) {
        const d = diffVal.trim();
        if (d === '简单' || d === '中等' || d === '困难') difficulty = d;
        section = 'none';
      } else {
        const tagVal = matchFieldValue(trimmed, '标签');
        if (tagVal !== null) {
          tags = tagVal.split(/[,，]/).map(t => t.trim()).filter(Boolean);
          section = 'none';
        } else if (isFieldHeaderOnly(trimmed, '回答要点')) {
          section = 'points';
        } else if (isFieldHeaderOnly(trimmed, '参考答案')) {
          section = 'answer';
        } else if (section === 'points') {
          // Any non-empty line in points section is a point
          // Strip leading "- " or "· " or "• " if present
          if (trimmed) {
            const cleaned = trimmed.replace(/^[-·•]\s*/, '');
            if (cleaned) answerPoints.push(cleaned);
          }
          // Blank lines in points section are ignored (don't break section)
        } else if (section === 'answer') {
          // All lines in answer section are part of the answer (including blank lines for paragraph breaks)
          if (referenceAnswer) {
            referenceAnswer += '\n' + block[i]; // preserve original whitespace for blank lines
          } else {
            referenceAnswer = block[i];
          }
        }
      }
    }
  }

  // Trim reference answer but preserve internal structure
  referenceAnswer = referenceAnswer.trim();

  return {
    title,
    content: '',
    category,
    difficulty,
    tags,
    answerPoints,
    referenceAnswer,
  };
}

/**
 * Main parser: detects format automatically and parses all questions.
 * Format A: ## Title lines (hash-style)
 * Format B: Real-world format (title followed by 分类：)
 */
export function parseBatchQuestions(text: string): QuestionFormData[] {
  if (!text.trim()) return [];

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  // If hash-style markers exist, use them to split (most reliable)
  if (/^## /m.test(normalized)) {
    const blocks = normalized.split(/^## /gm).filter(Boolean);
    const results: QuestionFormData[] = [];
    for (const block of blocks) {
      const blockLines = block.split('\n');
      const q = parseQuestionBlock(blockLines, 0, blockLines.length);
      if (q) results.push(q);
    }
    return results;
  }

  // Format B: detect question boundaries by looking ahead for 分类：
  const ranges = findQuestionRanges(lines);
  const results: QuestionFormData[] = [];
  for (const range of ranges) {
    const q = parseQuestionBlock(lines, range.start, range.end);
    if (q) results.push(q);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

export default function BatchImportModal({ isOpen, onClose, onImport }: BatchImportModalProps) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShowExample = () => {
    setText(EXAMPLE_TEXT);
    setFeedback(null);
  };

  const handleImport = () => {
    const parsed = parseBatchQuestions(text);
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

  // Live preview: count questions as user types
  const previewCount = text.trim() ? parseBatchQuestions(text).length : 0;

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
            <p>直接粘贴题目文本即可。支持两种格式：</p>
            <p>1) 每题首行为标题，下一行 <code className="bg-gray-100 px-1 rounded">分类：</code>，题目之间无需空行分隔。</p>
            <p>2) <code className="bg-gray-100 px-1 rounded">## 标题</code> Markdown 格式。</p>
          </div>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFeedback(null); }}
            placeholder={`题目标题\n分类：分类名\n难度：简单\n标签：标签1, 标签2\n回答要点：\n要点一\n要点二\n参考答案：\n参考答案内容...\n\n第二道题标题\n分类：...\n难度：...\n...`}
            rows={16}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          {text.trim() && (
            <div className="text-xs text-gray-400">
              识别到 <span className="font-medium text-gray-600">{previewCount}</span> 道题目
            </div>
          )}

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
