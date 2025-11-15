import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsAPI } from '../api';
import toast from 'react-hot-toast';

export const useLists = () => {
  return useQuery({
    queryKey: ['lists'],
    queryFn: listsAPI.getLists,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listsAPI.createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List created!');
    },
    onError: () => {
      toast.error('Failed to create list');
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => listsAPI.updateList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List updated!');
    },
    onError: () => {
      toast.error('Failed to update list');
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listsAPI.deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List deleted');
    },
    onError: () => {
      toast.error('Failed to delete list');
    },
  });
};
