import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todosAPI } from '../api';
import toast from 'react-hot-toast';

export const useTodos = (filters = {}) => {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todosAPI.getTodos(filters),
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todosAPI.createTodo,
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update
      queryClient.setQueryData(['todos'], (old) => ({
        ...old,
        todos: [
          {
            ...newTodo,
            _id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'todo',
          },
          ...(old?.todos || []),
        ],
      }));

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(['todos'], context.previousTodos);
      toast.error('Failed to create todo');
    },
    onSuccess: () => {
      toast.success('Todo created!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => todosAPI.updateTodo(id, data),
    onSuccess: (response) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update todo');
      // Refetch to ensure correct state
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todosAPI.deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (old) => ({
        ...old,
        todos: old?.todos.filter((todo) => todo._id !== id),
      }));

      return { previousTodos };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
      toast.error('Failed to delete todo');
    },
    onSuccess: () => {
      toast.success('Todo deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
