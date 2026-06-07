import { useState, useEffect } from 'react';
import { X, KeyRound } from 'lucide-react';
import type { AiSettings } from '../types/question';
import { DEFAULT_AI_SETTINGS } from '../types/question';
import { loadAiSettings, saveAiSettings } from '../utils/ai';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiSettingsModal({ isOpen, onClose }: AiSettingsModalProps) {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAiSettings());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleClear = () => {
    setSettings(DEFAULT_AI_SETTINGS);
    saveAiSettings(DEFAULT_AI_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">AI 设置</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500">
            配置 OpenAI 兼容的 API 地址、密钥和模型名称。兼容所有支持 Chat Completions 格式的服务。
          </p>
          <p className="text-xs text-orange-500">
            提示：URL 应以 /v1 结尾，如 https://api.example.com/v1
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={settings.baseURL}
              onChange={(e) => setSettings({ ...settings, baseURL: e.target.value })}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型名称
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              placeholder="gpt-4o"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {saved && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              AI 设置已保存
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-5 border-t border-gray-100">
          <button
            onClick={handleClear}
            className="px-3 py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            清空设置
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
