import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiImage, FiFileText, FiSend, FiX, FiLoader, FiLayers } from 'react-icons/fi';
import { AiOutlineCamera } from 'react-icons/ai';
import { aiAPI } from '../api';
import toast from 'react-hot-toast';

const AITaskInput = ({ onTasksCreated, listId = null, aiEnabled = true, multimediaEnabled = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState('text'); // text, voice, image
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      // If AI is disabled, just show info message
      if (!aiEnabled) {
        toast.error('AI features are disabled in your profile settings');
        setIsLoading(false);
        return;
      }

      const result = await aiAPI.analyzeText(textInput);
      
      if (result.tasks && result.tasks.length > 0) {
        // Create the tasks
        await aiAPI.createTasksFromAI(result.tasks, listId);
        toast.success(`Created ${result.count} task(s) from your input!`);
        onTasksCreated?.(result.tasks);
        setTextInput('');
        setIsOpen(false);
      } else {
        toast.error('No tasks found in your input');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiAPI.analyzeImage(file);
      
      if (result.tasks && result.tasks.length > 0) {
        await aiAPI.createTasksFromAI(result.tasks, listId);
        toast.success(`Created ${result.count} task(s) from your image!`);
        onTasksCreated?.(result.tasks);
        setIsOpen(false);
      } else {
        toast.error('No tasks found in the image');
      }
    } catch (error) {
      console.error('AI image analysis error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async (audioBlob) => {
    setIsLoading(true);
    try {
      // For now, show info - full voice transcription needs additional service
      toast('Voice transcription coming soon! Converting to text input...', {
        icon: '🎤',
      });
      setInputMode('text');
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl"
        >
          <FiLayers className="w-6 h-6" />
        </motion.button>
      </div>

      {/* AI Input Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !isLoading && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Task Creator
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    inputMode === 'text'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiFileText className="w-4 h-4" />
                  Text
                </button>
                {multimediaEnabled && (
                  <>
                    <button
                      onClick={() => setInputMode('voice')}
                      className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        inputMode === 'voice'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <FiMic className="w-4 h-4" />
                      Voice
                    </button>
                    <button
                      onClick={() => {
                        setInputMode('image');
                        fileInputRef.current?.click();
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                        inputMode === 'image'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <FiImage className="w-4 h-4" />
                      Image
                    </button>
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="mb-4">
                {inputMode === 'text' && (
                  <div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste your notes, emails, or describe tasks naturally..."
                      className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleTextAnalysis}
                      disabled={isLoading || !textInput.trim()}
                      className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading ? (
                        <>
                          <FiLoader className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-5 h-5" />
                          Create Tasks
                        </>
                      )}
                    </button>
                  </div>
                )}

                {inputMode === 'voice' && (
                  <div className="flex flex-col items-center justify-center h-40">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg'
                      }`}
                    >
                      <FiMic className="w-8 h-8 text-white" />
                    </button>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                      {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-1">AI can extract tasks from:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Natural language descriptions</li>
                  <li>Screenshots of assignments</li>
                  <li>Photos of handwritten notes</li>
                  <li>PDF documents</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITaskInput;
