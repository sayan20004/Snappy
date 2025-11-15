import { useState } from 'react';
import { FiMail, FiMessageCircle, FiImage, FiMic, FiChrome, FiPlus, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTodo } from '../hooks/useTodos';
import toast from 'react-hot-toast';

export default function SmartInbox() {
  const [inboxItems, setInboxItems] = useState([
    {
      id: '1',
      source: 'email',
      title: 'Review Q4 budget proposal',
      content: 'From: finance@company.com\nSubject: Q4 Budget Review Needed\n\nPlease review the attached Q4 budget proposal by EOD Friday.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      metadata: { sender: 'finance@company.com', subject: 'Q4 Budget Review Needed' }
    },
    {
      id: '2',
      source: 'whatsapp',
      title: 'Pick up groceries',
      content: 'Mom: Can you pick up milk, eggs, and bread on your way home?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      metadata: { contact: 'Mom' }
    },
    {
      id: '3',
      source: 'screenshot',
      title: 'Bug report from screenshot',
      content: 'Screenshot captured: Login page showing 404 error on mobile Safari',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      metadata: { imageUrl: '/screenshots/bug-001.png' }
    }
  ]);

  const [selectedItems, setSelectedItems] = useState(new Set());
  const createTodoMutation = useCreateTodo();

  const sourceConfig = {
    email: { icon: FiMail, color: 'blue', label: 'Email' },
    whatsapp: { icon: FiMessageCircle, color: 'green', label: 'WhatsApp' },
    screenshot: { icon: FiImage, color: 'purple', label: 'Screenshot' },
    voice: { icon: FiMic, color: 'red', label: 'Voice Note' },
    extension: { icon: FiChrome, color: 'yellow', label: 'Browser' }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const convertToTask = async (item) => {
    try {
      await createTodoMutation.mutateAsync({
        title: item.title,
        note: item.content,
        source: item.source,
        tags: [item.source]
      });

      setInboxItems(prev => prev.filter(i => i.id !== item.id));
      toast.success('Converted to task!');
    } catch (error) {
      toast.error('Failed to convert');
    }
  };

  const convertSelected = async () => {
    const itemsToConvert = inboxItems.filter(item => selectedItems.has(item.id));
    
    for (const item of itemsToConvert) {
      await convertToTask(item);
    }
    
    setSelectedItems(new Set());
  };

  const dismissItem = (id) => {
    setInboxItems(prev => prev.filter(i => i.id !== id));
    selectedItems.delete(id);
  };

  const formatTimestamp = (date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📥 Smart Inbox
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Capture tasks from multiple sources
          </p>
        </div>

        {selectedItems.size > 0 && (
          <button
            onClick={convertSelected}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiPlus />
            Convert {selectedItems.size} to Tasks
          </button>
        )}
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(sourceConfig).map(([source, config]) => {
          const Icon = config.icon;
          const isConnected = source === 'email' || source === 'whatsapp' || source === 'screenshot';
          
          return (
            <div
              key={source}
              className={`card p-4 text-center border-2 ${
                isConnected ? `border-${config.color}-200 bg-${config.color}-50` : 'border-gray-200 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-full bg-${config.color}-100 flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`text-${config.color}-600`} size={20} />
              </div>
              <div className="text-xs font-medium text-gray-900">{config.label}</div>
              <div className={`text-xs mt-1 ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                {isConnected ? '✓ Connected' : 'Not connected'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inbox Items */}
      <div className="space-y-3">
        {inboxItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Inbox Zero!
            </h3>
            <p className="text-gray-500 text-sm">
              All caught up. New items will appear here automatically.
            </p>
          </div>
        ) : (
          inboxItems.map((item, idx) => {
            const config = sourceConfig[item.source];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`card p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-${config.color}-500 ${
                  selectedItems.has(item.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                }`}
                onClick={() => toggleSelect(item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                      selectedItems.has(item.id)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedItems.has(item.id) && <FiCheck className="text-white" size={14} />}
                  </div>

                  {/* Source Icon */}
                  <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`text-${config.color}-600`} size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.content}
                    </p>

                    {item.metadata && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {item.metadata.sender && <span>From: {item.metadata.sender}</span>}
                        {item.metadata.contact && <span>Contact: {item.metadata.contact}</span>}
                        {item.metadata.subject && <span className="truncate max-w-xs">Subject: {item.metadata.subject}</span>}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        convertToTask(item);
                      }}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
                      title="Convert to task"
                    >
                      <FiPlus className="text-green-600 group-hover:scale-110 transition-transform" size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissItem(item.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                      title="Dismiss"
                    >
                      <FiX className="text-red-600 group-hover:scale-110 transition-transform" size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Setup Instructions */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FiChrome size={20} />
          Setup Integrations
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>📧 <strong>Email:</strong> Forward emails to <code className="px-2 py-1 bg-white rounded">inbox@snappytodo.app</code></p>
          <p>💬 <strong>WhatsApp:</strong> Connect via Settings → Integrations → WhatsApp</p>
          <p>📸 <strong>Screenshots:</strong> Install browser extension for automatic OCR</p>
          <p>🎤 <strong>Voice:</strong> Use mobile app voice capture (coming soon)</p>
          <p>🌐 <strong>Browser:</strong> Install Chrome/Firefox extension from Web Store</p>
        </div>
      </div>
    </div>
  );
}
