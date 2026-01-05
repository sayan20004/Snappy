import { useState, useRef } from 'react';
import {
  FiMail,
  FiMessageCircle,
  FiImage,
  FiMic,
  FiChrome,
  FiPlus,
  FiCheck,
  FiX,
  FiUpload,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTodo } from '../hooks/useTodos';
import { useSmartInbox } from '../hooks/useSmartInbox';
import toast from 'react-hot-toast';

export default function SmartInbox() {
  const {
    inboxItems,
    isLoading,
    processingItems,
    processScreenshot,
    processText,
    processVoice,
    dismissItem,
  } = useSmartInbox();

  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const screenshotInputRef = useRef(null);
  const voiceInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const createTodoMutation = useCreateTodo();

  const sourceConfig = {
    email: { icon: FiMail, color: 'blue', label: 'Email' },
    whatsapp: { icon: FiMessageCircle, color: 'green', label: 'WhatsApp' },
    screenshot: { icon: FiImage, color: 'purple', label: 'Screenshot' },
    voice: { icon: FiMic, color: 'red', label: 'Voice Note' },
    text: { icon: FiFileText, color: 'yellow', label: 'Text' },
    extension: { icon: FiChrome, color: 'yellow', label: 'Browser' },
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const convertToTask = async (item, skipReview = false) => {
    // High confidence items (>90%) can be auto-converted
    const autoConvert = skipReview && item.confidence >= 0.9;

    try {
      if (autoConvert) {
        // Direct conversion
        await createTodoMutation.mutateAsync({
          title: item.title,
          note: item.note || item.reasoning,
          priority: item.priority,
          dueAt: item.dueDate,
          tags: item.tags || [item.source],
          suggestedSubtasks: item.suggestedSubtasks,
          aiClassification: {
            confidence: item.confidence,
            source: 'smart-inbox',
          },
        });

        dismissItem.mutate(item.id);
        toast.success('Task created!');
      } else {
        // Show review modal for low confidence items
        // TODO: Implement review modal
        toast.info('Review task before creating (coming soon)');
      }
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    }
  };

  const convertSelected = async () => {
    const itemsToConvert = inboxItems.filter((item) =>
      selectedItems.has(item.id)
    );

    for (const item of itemsToConvert) {
      await convertToTask(item, false);
    }

    setSelectedItems(new Set());
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    processScreenshot.mutate(file);
    e.target.value = ''; // Reset input
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    processText.mutate(textInput);
    setTextInput('');
    setShowTextInput(false);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        processVoice.mutate(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      toast.error('Microphone access denied');
      console.error(error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Processing voice...');
    }
  };

  const formatTimestamp = (date) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            📥 Smart Inbox
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI-powered task capture from multiple sources
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

      {/* Integration Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Screenshot Upload */}
        <button
          onClick={() => screenshotInputRef.current?.click()}
          className="card p-4 text-center hover:shadow-md transition-all border-2 border-dashed border-purple-300 hover:border-purple-500"
        >
          <input
            ref={screenshotInputRef}
            type="file"
            accept="image/*"
            onChange={handleScreenshotUpload}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
            <FiImage className="text-purple-600" size={20} />
          </div>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            Upload Screenshot
          </div>
          <div className="text-xs text-purple-600 mt-1">AI OCR Enabled</div>
        </button>

        {/* Text Input */}
        <button
          onClick={() => setShowTextInput(true)}
          className="card p-4 text-center hover:shadow-md transition-all border-2 border-dashed border-yellow-300 hover:border-yellow-500"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
            <FiFileText className="text-yellow-600" size={20} />
          </div>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            Paste Text
          </div>
          <div className="text-xs text-yellow-600 mt-1">Email, Chat, Notes</div>
        </button>

        {/* Voice Recording */}
        <button
          onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
          className={`card p-4 text-center hover:shadow-md transition-all border-2 border-dashed ${
            isRecording
              ? 'border-red-500 bg-red-50 animate-pulse'
              : 'border-red-300 hover:border-red-500'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-red-100'
            } flex items-center justify-center mx-auto mb-2`}
          >
            <FiMic
              className={isRecording ? 'text-white' : 'text-red-600'}
              size={20}
            />
          </div>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {isRecording ? 'Stop Recording' : 'Voice Note'}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {isRecording ? 'Recording...' : 'AI Transcription'}
          </div>
        </button>

        {/* Email (Coming Soon) */}
        <div className="card p-4 text-center opacity-50 border-2 border-dashed border-gray-300">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
            <FiMail className="text-gray-400" size={20} />
          </div>
          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
            Email
          </div>
          <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
        </div>
      </div>

      {/* Text Input Modal */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTextInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Paste Text to Analyze
              </h3>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste email, chat messages, or notes here..."
                className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || processText.isPending}
                  className="btn btn-primary flex-1"
                >
                  {processText.isPending ? 'Analyzing...' : 'Analyze with AI'}
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="btn px-6"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Skeleton */}
      <AnimatePresence>
        {processingItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card p-4 border-2 border-purple-300 bg-purple-50 dark:bg-purple-900/20"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  AI is analyzing your input...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extracting tasks, priorities, and deadlines
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox Items */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : inboxItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Inbox Zero!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Upload a screenshot, paste text, or record a voice note to get
              started.
            </p>
          </div>
        ) : (
          inboxItems.map((item, idx) => {
            const config = sourceConfig[item.source] || sourceConfig.text;
            const Icon = config.icon;
            const confidence = item.confidence || 0;

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`card p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-${config.color}-500 ${
                  selectedItems.has(item.id)
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
                onClick={() => item.id && toggleSelect(item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  {item.id && (
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                        selectedItems.has(item.id)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <FiCheck className="text-white" size={14} />
                      )}
                    </div>
                  )}

                  {/* Source Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`text-${config.color}-600`} size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>

                    {item.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {item.note}
                      </p>
                    )}

                    {/* AI Metadata */}
                    <div className="flex items-center gap-3 text-xs mt-2">
                      {/* Confidence Score */}
                      {confidence > 0 && (
                        <div
                          className={`flex items-center gap-1 ${getConfidenceColor(
                            confidence
                          )}`}
                        >
                          <div
                            className="w-3 h-3 rounded-full border-2"
                            style={{
                              background: `conic-gradient(currentColor ${
                                confidence * 100
                              }%, transparent 0)`,
                            }}
                          />
                          <span className="font-medium">
                            {Math.round(confidence * 100)}%{' '}
                            {getConfidenceLabel(confidence)}
                          </span>
                        </div>
                      )}

                      {/* Priority Badge */}
                      {item.priority !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            item.priority === 3
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {['Low', 'Normal', 'High', 'Urgent'][item.priority] ||
                            'Normal'}
                        </span>
                      )}

                      {/* Due Date */}
                      {item.dueDate && (
                        <span className="text-gray-500 dark:text-gray-400">
                          📅 {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {/* Tags */}
                      {item.tags?.length > 0 && (
                        <div className="flex gap-1">
                          {item.tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggested Subtasks Preview */}
                    {item.suggestedSubtasks?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Suggested steps:</span>{' '}
                        {item.suggestedSubtasks[0]}
                        {item.suggestedSubtasks.length > 1 &&
                          ` (+${item.suggestedSubtasks.length - 1} more)`}
                      </div>
                    )}

                    {/* Low Confidence Warning */}
                    {confidence > 0 && confidence < 0.7 && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-2 rounded">
                        <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                        <span>
                          Low confidence. Please review before creating task.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {confidence >= 0.9 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToTask(item, true);
                        }}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition-colors group"
                        title="Auto-convert (high confidence)"
                      >
                        <FiCheck
                          className="text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
                          size={18}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          convertToTask(item, false);
                        }}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                        title="Review and convert"
                      >
                        <FiPlus
                          className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"
                          size={18}
                        />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.id && dismissItem.mutate(item.id);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                      title="Dismiss"
                    >
                      <FiX
                        className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Setup Instructions */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <FiChrome size={20} />
          How Smart Inbox Works
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            📸 <strong>Screenshots:</strong> Upload images and our AI will
            extract tasks using OCR
          </p>
          <p>
            📝 <strong>Text:</strong> Paste emails, chat messages, or notes for
            instant task extraction
          </p>
          <p>
            🎤 <strong>Voice:</strong> Record quick voice notes that are
            transcribed and analyzed
          </p>
          <p>
            ✨ <strong>AI Confidence:</strong> High confidence items (90%+) can
            be auto-converted
          </p>
        </div>
      </div>
    </div>
  );
}
