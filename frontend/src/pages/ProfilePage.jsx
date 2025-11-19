import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { FiUser, FiMail, FiCamera, FiLink, FiSave, FiX, FiZap, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getFullAvatarUrl } from '../utils/avatarUrl';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [avatarMethod, setAvatarMethod] = useState('upload'); // 'upload' or 'link'
  const [imageFile, setImageFile] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(user?.settings?.aiEnabled ?? true);
  const [multimediaEnabled, setMultimediaEnabled] = useState(user?.settings?.multimediaEnabled ?? true);
  
  const initialAvatarUrl = getFullAvatarUrl(user?.avatarUrl);
  console.log('🖼️ Avatar Debug:', {
    userAvatarUrl: user?.avatarUrl,
    fullAvatarUrl: initialAvatarUrl,
    userName: user?.name
  });
  
  const [previewUrl, setPreviewUrl] = useState(initialAvatarUrl);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch('/users/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
      useAuthStore.getState().updateUser(data.user);
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
      useAuthStore.getState().updateUser(data.user);
      const fullAvatarUrl = getFullAvatarUrl(data.avatarUrl);
      console.log('✅ Avatar uploaded:', {
        returnedUrl: data.avatarUrl,
        fullUrl: fullAvatarUrl,
        userData: data.user
      });
      setPreviewUrl(fullAvatarUrl);
      setAvatarUrl(data.avatarUrl);
      toast.success('Avatar uploaded successfully!');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to upload avatar';
      toast.error(message);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPG, PNG, or GIF)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (avatarMethod === 'upload' && imageFile) {
      await uploadAvatarMutation.mutateAsync(imageFile);
    }

    await updateProfileMutation.mutateAsync({
      name,
      avatarUrl: avatarMethod === 'link' ? avatarUrl : undefined,
      settings: {
        aiEnabled,
        multimediaEnabled
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiUser />
              Profile Settings
            </h1>
            <p className="text-primary-100 mt-1">Manage your account information</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary-600 text-white flex items-center justify-center text-4xl font-bold border-4 border-gray-200 dark:border-gray-700">
                    {name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors">
                  <FiCamera size={20} />
                </button>
              </div>

              {/* Avatar Method Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAvatarMethod('upload')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    avatarMethod === 'upload'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setAvatarMethod('link')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    avatarMethod === 'link'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Use Link
                </button>
              </div>

              {/* Upload or Link Input */}
              {avatarMethod === 'upload' ? (
                <div className="w-full max-w-sm">
                  <label className="block">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <FiCamera />
                      <span>{imageFile ? imageFile.name : 'Choose image (JPG, PNG, GIF)'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Max size: 5MB. Supported: JPG, PNG, GIF
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-sm">
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => {
                        setAvatarUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/image.gif"
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 border-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Enter image URL (supports JPG, PNG, GIF)
                  </p>
                </div>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-600 border-0"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiMail className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg border-0 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Feature Settings
              </h3>
              
              {/* AI Features Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FiZap className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      AI Features
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      AI suggestions, task assistant, and smart features
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Multimedia Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FiImage className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Multimedia Features
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Image uploads, voice input, and file attachments
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMultimediaEnabled(!multimediaEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    multimediaEnabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      multimediaEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <FiSave />
                {updateProfileMutation.isPending || uploadAvatarMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  navigate('/');
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                <FiX className="inline mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
