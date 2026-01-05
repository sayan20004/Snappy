import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiAPI } from '../api';
import api from '../api/client';
import toast from 'react-hot-toast';

export const useSmartInbox = () => {
  const queryClient = useQueryClient();
  const [processingItems, setProcessingItems] = useState(new Set());

  // Fetch inbox items (if backend supports it)
  const { data: inboxItems = [], isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => {
      // TODO: Replace with real API call when backend is ready
      // return api.get('/inbox').then(res => res.data);
      return [];
    },
    staleTime: 30000,
  });

  // Check email connection status
  const { data: emailStatus } = useQuery({
    queryKey: ['email-connection'],
    queryFn: async () => {
      try {
        const response = await api.get('/inbox/email/status');
        return response.data;
      } catch (error) {
        return { connected: false };
      }
    },
    staleTime: 60000,
  });

  // Fetch emails
  const { data: emails = [], isLoading: emailsLoading, refetch: refetchEmails } = useQuery({
    queryKey: ['inbox-emails'],
    queryFn: async () => {
      try {
        const response = await api.get('/inbox/email/fetch');
        return response.data.emails || [];
      } catch (error) {
        console.error('Failed to fetch emails:', error);
        return [];
      }
    },
    enabled: emailStatus?.connected === true,
    staleTime: 30000,
  });

  // Connect email provider
  const connectEmail = useMutation({
    mutationFn: async ({ provider, credentials }) => {
      const response = await api.post('/inbox/email/connect', {
        provider,
        ...credentials,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['email-connection']);
      toast.success('Email connected successfully!');
    },
    onError: (error) => {
      toast.error('Failed to connect email: ' + (error.response?.data?.message || error.message));
    },
  });

  // Process email with AI
  const processEmail = useMutation({
    mutationFn: async (email) => {
      const emailText = `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body || email.snippet}`;
      const result = await aiAPI.analyzeText(emailText);
      return {
        ...result,
        id: `email-${email.id}-${Date.now()}`,
        source: 'email',
        rawEmail: email,
        timestamp: new Date(email.date || Date.now()),
        metadata: {
          from: email.from,
          subject: email.subject,
          emailId: email.id,
        },
      };
    },
    onMutate: () => {
      const tempId = `processing-email-${Date.now()}`;
      setProcessingItems((prev) => new Set(prev).add(tempId));
      return { tempId };
    },
    onSuccess: (data, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      queryClient.setQueryData(['inbox'], (old = []) => [data, ...old]);
      toast.success('Email analyzed successfully!');
    },
    onError: (error, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      toast.error('Failed to analyze email');
      console.error(error);
    },
  });

  // Process screenshot with AI
  const processScreenshot = useMutation({
    mutationFn: async (file) => {
      const result = await aiAPI.analyzeImage(file);
      return {
        ...result,
        source: 'screenshot',
        rawFile: file,
        timestamp: new Date(),
      };
    },
    onMutate: (file) => {
      const tempId = `processing-${Date.now()}`;
      setProcessingItems((prev) => new Set(prev).add(tempId));
      return { tempId };
    },
    onSuccess: (data, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      queryClient.setQueryData(['inbox'], (old = []) => [data, ...old]);
      toast.success('Screenshot analyzed successfully!');
    },
    onError: (error, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      toast.error('Failed to analyze screenshot');
      console.error(error);
    },
  });

  // Process text/email with AI
  const processText = useMutation({
    mutationFn: async (text) => {
      const result = await aiAPI.analyzeText(text);
      return {
        ...result,
        source: 'text',
        rawText: text,
        timestamp: new Date(),
      };
    },
    onMutate: () => {
      const tempId = `processing-text-${Date.now()}`;
      setProcessingItems((prev) => new Set(prev).add(tempId));
      return { tempId };
    },
    onSuccess: (data, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      queryClient.setQueryData(['inbox'], (old = []) => [data, ...old]);
      toast.success('Text analyzed successfully!');
    },
    onError: (error, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      toast.error('Failed to analyze text');
      console.error(error);
    },
  });

  // Process voice note
  const processVoice = useMutation({
    mutationFn: async (audioBlob) => {
      // Convert blob to transcript, then analyze
      const result = await aiAPI.summarizeTranscript(audioBlob);
      return {
        ...result,
        source: 'voice',
        rawAudio: audioBlob,
        timestamp: new Date(),
      };
    },
    onMutate: () => {
      const tempId = `processing-voice-${Date.now()}`;
      setProcessingItems((prev) => new Set(prev).add(tempId));
      return { tempId };
    },
    onSuccess: (data, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      queryClient.setQueryData(['inbox'], (old = []) => [data, ...old]);
      toast.success('Voice note analyzed successfully!');
    },
    onError: (error, _, context) => {
      setProcessingItems((prev) => {
        const next = new Set(prev);
        next.delete(context.tempId);
        return next;
      });
      toast.error('Failed to analyze voice note');
      console.error(error);
    },
  });

  // Remove item from inbox
  const dismissItem = useMutation({
    mutationFn: async (itemId) => {
      // TODO: Call backend to mark as dismissed
      return itemId;
    },
    onSuccess: (itemId) => {
      queryClient.setQueryData(['inbox'], (old = []) =>
        old.filter((item) => item.id !== itemId)
      );
      toast.success('Item dismissed');
    },
  });

  return {
    inboxItems,
    isLoading,
    processingItems,
    processScreenshot,
    processText,
    processVoice,
    dismissItem,
    // Email functionality
    emailStatus,
    emails,
    emailsLoading,
    refetchEmails,
    connectEmail,
    processEmail,
  };
};
