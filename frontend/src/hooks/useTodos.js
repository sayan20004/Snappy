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
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);

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

// TASK C: Optimistic UI for toggleTodo
export const useToggleTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => todosAPI.updateTodo(id, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update to the new value (instant UI update)
      queryClient.setQueryData(['todos'], (old) => {
        if (!old?.todos) return old;
        return {
          ...old,
          todos: old.todos.map((todo) =>
            todo._id === id
              ? { ...todo, status, completedAt: status === 'done' ? new Date().toISOString() : null }
              : todo
          ),
        };
      });

      // Return context with snapshot for rollback
      return { previousTodos };
    },
    onError: (err, { id }, context) => {
      // Rollback to previous state on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast.error('Failed to toggle todo');
    },
    onSettled: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => todosAPI.updateTodo(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update todo');
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
