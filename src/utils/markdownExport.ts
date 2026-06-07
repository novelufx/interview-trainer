import type { InterviewQuestion } from '../types/question';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function exportMarkdown(questions: InterviewQuestion[], filename?: string): void {
  const lines: string[] = [];
  lines.push('# 面试题导出');
  lines.push('');
  lines.push(`> 导出时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push(`> 共 ${questions.length} 道题目`);
  lines.push('');

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    lines.push(`## ${i + 1}. ${q.title}`);
    lines.push('');
    lines.push(`- **分类**：${q.category}`);
    lines.push(`- **难度**：${q.difficulty}`);
    if (q.tags.length > 0) {
      lines.push(`- **标签**：${q.tags.join('、')}`);
    }
    lines.push(`- **掌握状态**：${q.masteryStatus}`);
    if (q.nextReviewAt) {
      lines.push(`- **下次复习**：${q.nextReviewAt}`);
    }
    lines.push('');

    if (q.content) {
      lines.push('### 题目内容');
      lines.push('');
      lines.push(q.content);
      lines.push('');
    }

    if (q.userAnswer) {
      lines.push('### 我的回答');
      lines.push('');
      lines.push(q.userAnswer);
      lines.push('');
    }

    if (q.answerPoints.length > 0) {
      lines.push('### 回答要点');
      lines.push('');
      for (const p of q.answerPoints) {
        lines.push(`- ${p}`);
      }
      lines.push('');
    }

    if (q.referenceAnswer) {
      lines.push('### 参考答案');
      lines.push('');
      lines.push(q.referenceAnswer);
      lines.push('');
    }

    if (q.aiOptimizedAnswer) {
      lines.push('### AI 优化回答');
      lines.push('');
      lines.push(q.aiOptimizedAnswer);
      lines.push('');
    }

    if (q.aiScore) {
      lines.push('### AI 评分');
      lines.push('');
      if (q.aiScore.totalScore > 0) {
        lines.push(`**总分：${q.aiScore.totalScore}/40**`);
        lines.push('');
      }
      for (const d of q.aiScore.dimensions) {
        lines.push(`- ${d.name}：${d.score}/10`);
      }
      lines.push('');
      if (q.aiScore.strengths) lines.push(`**优点**：${q.aiScore.strengths}`);
      if (q.aiScore.weaknesses) lines.push(`**不足**：${q.aiScore.weaknesses}`);
      if (q.aiScore.suggestions) lines.push(`**建议**：${q.aiScore.suggestions}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `interview-questions-${todayStr()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
