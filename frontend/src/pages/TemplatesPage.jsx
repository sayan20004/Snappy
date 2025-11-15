import TaskTemplates from '../components/TaskTemplates';
import ExportImport from '../components/ExportImport';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'export'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Productivity Tools</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Templates, automation, and data management
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Templates & Recurring
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'export'
                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Export & Import
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {activeTab === 'templates' ? <TaskTemplates /> : <ExportImport />}
      </div>
    </div>
  );
}
