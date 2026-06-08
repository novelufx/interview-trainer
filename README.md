# 面试题训练器 / Interview Trainer

一个用于整理和练习前端面试题的本地 Web 应用。支持按分类管理题库、逐题练习、记录回答、收藏重点题、追踪掌握状态、AI 辅助优化与评分，并提供复习计划、批量导入导出能力。所有数据存储在浏览器 localStorage 中，无需后端服务。

> 当前版本：**v3.2.0**

> **[Demo](https://novelufx.github.io/interview-trainer/)**

---

## 功能列表

### V1 核心功能

- **添加题目**：弹窗表单，支持标题、内容、分类、难度、标签、回答要点、参考答案
- **编辑题目**：回填所有字段，保存后不影响用户回答、收藏和掌握状态
- **删除题目**：confirm 确认，删除后自动选中相邻题目
- **分类管理**：从题目自动提取分类，支持全部题目/我的收藏/自定义分类
- **搜索功能**：实时搜索标题、内容、分类、标签、参考答案，与分类筛选叠加
- **单题练习**：每次只显示一道题，支持上一题/下一题导航
- **用户回答区**：textarea 输入，实时保存，字数统计，切换题目不丢失
- **查看回答要点**：可折叠面板，点击展开/收起
- **查看参考答案**：可折叠面板，点击展开/收起
- **收藏题目**：Star 图标切换，左侧列表同步显示，支持收藏分类筛选
- **掌握状态**：未开始(灰)/不熟(红)/一般(黄)/已掌握(绿)，下拉框选择
- **localStorage 持久化**：题目、回答、收藏、掌握状态、选中题目全部持久化

### V2 新增功能

- **批量导入**：粘贴 Markdown 或结构化文本，一键批量添加题目
- **导出数据**：导出完整题库为 JSON 文件，含用户回答和状态
- **导入备份**：从 JSON 文件恢复题库，格式校验，confirm 确认
- **掌握状态筛选**：按未开始/不熟/一般/已掌握筛选题目
- **难度筛选**：按简单/中等/困难筛选题目
- **只练不熟题**：一键筛选未开始+不熟的题目，专注薄弱环节
- **随机一题**：基于当前筛选结果随机跳转
- **清空当前回答**：confirm 确认后清空当前题目的回答
- **重置示例数据**：一键恢复到初始示例数据
- **统计面板**：实时显示总题数、收藏数、各掌握状态数量

### V3 新增功能

- **AI 设置面板**：配置 OpenAI 兼容 API（Base URL / API Key / 模型名称），支持所有 Chat Completions 格式的服务
- **AI 优化回答**：根据用户实际回答进行优化——回答过短时给出思路提示，有实质内容时润色表达、补充遗漏要点
- **AI 评分**：从完整度、逻辑性、专业性、表达清晰度四个维度打分（满分 40），给出优点、不足和改进建议
- **AI 结果持久化**：优化结果和评分保存在题目数据中，刷新不丢失
- **复习计划**：为每道题设置下次复习日期，标记已复习，自动建议下次复习时间
- **今日待复习 / 已逾期**：统计面板实时显示待复习和逾期数量，支持按状态筛选
- **复习计划面板**：可折叠展示，显示状态标签、日期选择、标记复习、复习历史
- **Markdown 导出**：导出全部或当前筛选结果为 Markdown 文件，包含题目内容、回答、要点、参考答案、AI 结果
- **PDF 打印导出**：调用浏览器打印功能，可另存为 PDF
- **批量导入升级**：支持不带 `## ` 标记的结构化格式，题目之间用空行分隔即可
- **未配置 AI 时提示**：未配置 AI 时点击优化/评分按钮会给出配置引导

### V3.1 小版本修复

- **分类输入优化**：添加/编辑题目时支持从已有分类下拉选择，也可通过「+ 新建分类」录入新分类，新分类保存后会随题库自动进入后续可选列表
- **标签解析修复**：标签输入同时支持英文逗号 `,` 和中文逗号 `，`，并会自动去除首尾空格、过滤空标签

### V3.2 体验优化

- **侧边栏滚动优化**：左侧侧边栏改为整体纵向可滚动，页面缩放或内容较多时，分类、筛选、题目列表和底部数据管理区域都能更稳定地通过鼠标滚轮访问
- **题目详情折叠区默认关闭**：切换题目时，AI 优化回答、AI 评分、回答要点、参考答案都会默认收起，但相关内容和 AI 结果仍然保留

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 6.x | 类型安全 |
| Vite | 8.x | 构建工具与开发服务器 |
| Tailwind CSS | 4.x | 原子化 CSS 样式 |
| lucide-react | 1.17.x | 图标库 |
| localStorage | - | 本地数据持久化 |

---

## 安装和运行

```bash
git clone <repository-url>
cd interview-trainer
npm install
npm run dev
```

启动后终端会显示本地地址，默认 `http://localhost:5173`。

```bash
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
```

---

## 目录结构

```
interview-trainer/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.tsx                    # 核心状态管理与业务逻辑
│   ├── types/
│   │   └── question.ts            # TypeScript 类型定义（含 AI/复习类型）
│   ├── utils/
│   │   ├── storage.ts             # localStorage 读写
│   │   ├── sampleData.ts          # 示例题目数据
│   │   ├── ai.ts                  # AI 设置持久化、API 调用、Prompt 构建
│   │   └── markdownExport.ts      # Markdown 导出
│   └── components/
│       ├── Sidebar.tsx             # 左侧栏：搜索、统计、分类、筛选、操作按钮
│       ├── QuestionList.tsx        # 题目列表
│       ├── QuestionPractice.tsx    # 练习主区域
│       ├── AnswerPanel.tsx         # 回答要点与参考答案（可折叠）
│       ├── AiResultPanel.tsx       # AI 优化/评分结果展示
│       ├── AiSettingsModal.tsx     # AI 设置弹窗
│       ├── ReviewPanel.tsx         # 复习计划面板（可折叠）
│       ├── AddQuestionModal.tsx    # 添加/编辑题目弹窗
│       ├── BatchImportModal.tsx    # 批量导入弹窗
│       ├── StatsPanel.tsx          # 统计面板
│       ├── StatusBadge.tsx         # 难度/掌握状态标签
│       └── EmptyState.tsx          # 空状态提示
└── public/
```

---

## 数据存储

所有数据存储在浏览器 `localStorage` 中，不依赖后端服务。

| localStorage Key | 内容 |
|------------------|------|
| `interview_trainer_questions` | 完整题目数组（JSON） |
| `interview_trainer_selected_id` | 当前选中的题目 ID |
| `interview_trainer_ai_settings` | AI 配置（baseURL / apiKey / model） |

**题目数据结构（V3）**

```typescript
type Difficulty = '简单' | '中等' | '困难';
type MasteryStatus = '未开始' | '不熟' | '一般' | '已掌握';

interface InterviewQuestion {
  id: string;
  title: string;
  content: string;              // 题目详细内容
  category: string;
  tags: string[];
  difficulty: Difficulty;
  answerPoints: string[];
  referenceAnswer: string;
  userAnswer: string;
  favorite: boolean;
  masteryStatus: MasteryStatus;
  createdAt: string;
  updatedAt: string;
  // V3 复习字段（可选）
  nextReviewAt?: string;        // 下次复习日期 (YYYY-MM-DD)
  lastReviewedAt?: string;      // 上次复习时间 (ISO 8601)
  reviewCount?: number;         // 累计复习次数
  // V3 AI 字段（可选）
  aiOptimizedAnswer?: string;   // AI 优化后的回答
  aiScore?: AiScoreResult;      // AI 评分结果
}
```

V3 新增字段均为可选，旧版数据无需清空即可兼容。

---

## 批量导入格式

支持两种格式：

**格式一：Markdown 标记格式**

```markdown
## 题目标题
分类：分类名称
难度：简单
标签：标签1, 标签2
回答要点：
- 要点一
- 要点二
参考答案：
参考答案内容。
```

**格式二：结构化格式（无需 `## ` 标记）**

题目之间用空行分隔，首行为标题：

```
题目标题
分类：分类名称
难度：简单
标签：标签1, 标签2
回答要点：
- 要点一
参考答案：
参考答案内容。

第二道题标题
分类：另一个分类
...
```

---

## 导出说明

| 功能 | 格式 | 说明 |
|------|------|------|
| 导出数据 | JSON | 完整题库备份，含所有字段 |
| 导入备份 | JSON | 格式校验后覆盖导入 |
| MD 导出 | Markdown | 导出全部题目 |
| MD 当前 | Markdown | 仅导出当前筛选结果 |
| PDF | 打印 | 调用浏览器打印，可另存为 PDF |

---

## 已知限制

- 数据仅存储在浏览器 localStorage，不支持跨设备同步
- 不支持多用户协作
- 不支持导入/导出为 Anki、CSV 等格式
- 不支持暗色模式
- 大量题目（数千道）时性能可能下降
- localStorage 容量有限（约 5-10MB）
