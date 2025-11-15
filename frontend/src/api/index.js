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
