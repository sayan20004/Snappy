import api from './client';

// Get all users (for mentions/collaboration)
export const getUsers = async (search = '') => {
  const params = search ? { search } : {};
  const response = await api.get('/users', { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
