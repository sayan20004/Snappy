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

export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, data }) => listsAPI.inviteCollaborator(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Collaborator invited!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to invite collaborator');
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, userId }) => listsAPI.removeCollaborator(listId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Collaborator removed');
    },
    onError: () => {
      toast.error('Failed to remove collaborator');
    },
  });
};

export const useUpdateCollaboratorRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, userId, role }) => listsAPI.updateCollaboratorRole(listId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Role updated');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });
};
