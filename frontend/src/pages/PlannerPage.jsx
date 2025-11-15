import IntentionEngine from '../components/IntentionEngine';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Intention Engine</h1>
            <p className="text-sm text-gray-500 mt-1">
              AI-powered daily planning and task optimization
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <IntentionEngine />
      </div>
    </div>
  );
}
