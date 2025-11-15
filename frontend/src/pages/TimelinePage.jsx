import { useTodos } from '../hooks/useTodos';
import ActivityTimeline from '../components/ActivityTimeline';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function TimelinePage() {
  const { data, isLoading } = useTodos({ limit: 1000 }); // Get all todos for analytics

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
            <h1 className="text-2xl font-bold text-gray-900">Activity Timeline</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review your productivity patterns and track progress
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading activity data...
          </div>
        ) : (
          <ActivityTimeline todos={data?.todos || []} />
        )}
      </div>
    </div>
  );
}
