import api from './client';

export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const todosAPI = {
  getTodos: async (params = {}) => {
    const response = await api.get('/todos', { params });
    return response.data;
  },

  createTodo: async (data) => {
    const response = await api.post('/todos', data);
    return response.data;
  },

  updateTodo: async (id, data) => {
    const response = await api.patch(`/todos/${id}`, data);
    return response.data;
  },

  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

export const listsAPI = {
  getLists: async () => {
    const response = await api.get('/lists');
    return response.data;
  },

  createList: async (data) => {
    const response = await api.post('/lists', data);
    return response.data;
  },

  updateList: async (id, data) => {
    const response = await api.patch(`/lists/${id}`, data);
    return response.data;
  },

  deleteList: async (id) => {
    const response = await api.delete(`/lists/${id}`);
    return response.data;
  },

  inviteCollaborator: async (id, data) => {
    const response = await api.post(`/lists/${id}/invite`, data);
    return response.data;
  },
};

export const usersAPI = {
  getUsers: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

export const templatesAPI = {
  getTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  getPopularTemplates: async () => {
    const response = await api.get('/templates/popular');
    return response.data;
  },

  getTemplate: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  createTemplate: async (data) => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await api.patch(`/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  useTemplate: async (id, data = {}) => {
    const response = await api.post(`/templates/${id}/use`, data);
    return response.data;
  },
};

export const activitiesAPI = {
  getActivities: async (params = {}) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },
};

export const focusAPI = {
  startFocusSession: async (todoId, duration) => {
    const response = await api.post(`/focus/${todoId}/start`, { duration });
    return response.data;
  },

  stopFocusSession: async (todoId, data = {}) => {
    const response = await api.post(`/focus/${todoId}/stop`, data);
    return response.data;
  },

  getActiveFocusSession: async (todoId) => {
    const response = await api.get(`/focus/${todoId}/active`);
    return response.data;
  },

  getFocusStats: async () => {
    const response = await api.get('/focus/stats');
    return response.data;
  },

  getAllFocusSessions: async () => {
    const response = await api.get('/focus/sessions');
    return response.data;
  },
};

export const uploadAPI = {
  uploadVoice: async (file) => {
    const formData = new FormData();
    formData.append('voice', file);
    const response = await api.post('/upload/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFile: async (type, filename) => {
    const response = await api.delete(`/upload/${type}/${filename}`);
    return response.data;
  },
};

export const exportAPI = {
  exportToJSON: async () => {
    const response = await api.get('/export/json');
    return response.data;
  },

  exportToCSV: async () => {
    const response = await api.get('/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  importFromJSON: async (data) => {
    const response = await api.post('/import/json', data);
    return response.data;
  },

  importFromCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const commentsAPI = {
  addComment: async (todoId, data) => {
    const response = await api.post(`/todos/${todoId}/comments`, data);
    return response.data;
  },

  updateComment: async (todoId, commentId, data) => {
    const response = await api.patch(`/todos/${todoId}/comments/${commentId}`, data);
    return response.data;
  },

  deleteComment: async (todoId, commentId) => {
    const response = await api.delete(`/todos/${todoId}/comments/${commentId}`);
    return response.data;
  },

  addReaction: async (todoId, commentId, type) => {
    const response = await api.post(`/todos/${todoId}/comments/${commentId}/reactions`, { type });
    return response.data;
  },

  removeReaction: async (todoId, commentId) => {
    const response = await api.delete(`/todos/${todoId}/comments/${commentId}/reactions`);
    return response.data;
  },
};

export const aiAPI = {
  analyzeText: async (text) => {
    const response = await api.post('/ai/analyze/text', { text });
    return response.data;
  },

  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post('/ai/analyze/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSuggestions: async (params = {}) => {
    const response = await api.get('/ai/suggestions', { params });
    return response.data;
  },

  breakdownTask: async (taskId) => {
    const response = await api.post(`/ai/task/${taskId}/breakdown`);
    return response.data;
  },

  generateStudyPlan: async (data) => {
    const response = await api.post('/ai/learning/plan', data);
    return response.data;
  },

  executeCommand: async (command) => {
    const response = await api.post('/ai/command', { command });
    return response.data;
  },

  draftTaskContent: async (taskId, contentType = 'general') => {
    const response = await api.post(`/ai/task/${taskId}/draft`, { contentType });
    return response.data;
  },

  analyzeTaskPriority: async (taskId) => {
    const response = await api.post(`/ai/task/${taskId}/analyze-priority`);
    return response.data;
  },

  summarizeTranscript: async (transcript) => {
    const response = await api.post('/ai/meeting/summarize', { transcript });
    return response.data;
  },

  createTasksFromAI: async (tasks, listId = null) => {
    const response = await api.post('/ai/tasks/create', { tasks, listId });
    return response.data;
  },

  chatWithAI: async (message, context = null) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },
};

