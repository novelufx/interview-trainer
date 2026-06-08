import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { Difficulty } from '../types/question';
import { DIFFICULTY_OPTIONS } from '../types/question';

export interface QuestionFormData {
  title: string;
  content: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
  answerPoints: string[];
  referenceAnswer: string;
}

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: QuestionFormData) => void;
  categories: string[];
  initialData?: QuestionFormData;
}

const NEW_CATEGORY_VALUE = '__new_category__';

export default function AddQuestionModal({ isOpen, onClose, onAdd, categories, initialData }: AddQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('简单');
  const [tagsInput, setTagsInput] = useState('');
  const [answerPointsInput, setAnswerPointsInput] = useState('');
  const [referenceAnswer, setReferenceAnswer] = useState('');

  // Track whether the form has been initialized for the current open cycle
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      initializedRef.current = true;
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        if (categories.includes(initialData.category)) {
          setSelectedCategory(initialData.category);
          setNewCategory('');
        } else {
          setSelectedCategory(NEW_CATEGORY_VALUE);
          setNewCategory(initialData.category);
        }
        setCategoryError('');
        setDifficulty(initialData.difficulty);
        setTagsInput(initialData.tags.join(', '));
        setAnswerPointsInput(initialData.answerPoints.join('\n'));
        setReferenceAnswer(initialData.referenceAnswer);
      } else {
        setTitle('');
        setContent('');
        setSelectedCategory('');
        setNewCategory('');
        setCategoryError('');
        setDifficulty('简单');
        setTagsInput('');
        setAnswerPointsInput('');
        setReferenceAnswer('');
      }
    }
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category =
      selectedCategory === NEW_CATEGORY_VALUE ? newCategory.trim() : selectedCategory.trim();

    if (!title.trim()) return;
    if (!category) {
      setCategoryError('请选择已有分类或输入新分类');
      return;
    }

    const tags = tagsInput
      .split(/[，,]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const answerPoints = answerPointsInput
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    onAdd({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      difficulty,
      tags,
      answerPoints,
      referenceAnswer: referenceAnswer.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{initialData ? '编辑面试题' : '添加面试题'}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入题目标题"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="可选，补充题目描述"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCategoryError('');
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">请选择分类</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value={NEW_CATEGORY_VALUE}>+ 新建分类</option>
              </select>
              {selectedCategory === NEW_CATEGORY_VALUE && (
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setCategoryError('');
                  }}
                  placeholder="请输入新分类"
                  className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {categoryError && (
                <p className="mt-1 text-xs text-red-500">{categoryError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                难度
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="用逗号分隔，如：JavaScript, 闭包, 作用域"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              回答要点
            </label>
            <textarea
              value={answerPointsInput}
              onChange={(e) => setAnswerPointsInput(e.target.value)}
              placeholder="每行一个要点"
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              参考答案
            </label>
            <textarea
              value={referenceAnswer}
              onChange={(e) => setReferenceAnswer(e.target.value)}
              placeholder="请输入参考答案"
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
