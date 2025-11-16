/**
 * Get full avatar URL with API base
 * Handles both relative paths (from our API) and absolute URLs (external links)
 */
export const getFullAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const baseWithoutApi = apiBase.replace('/api', '');
  return `${baseWithoutApi}${url}`;
};
