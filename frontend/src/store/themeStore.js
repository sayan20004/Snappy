import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Apply theme to DOM immediately
const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        applyThemeToDOM(theme);
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        applyThemeToDOM(newTheme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.theme) {
        applyThemeToDOM(state.theme);
      }
    } catch (e) {
      console.error('Failed to parse theme:', e);
    }
  }
}
