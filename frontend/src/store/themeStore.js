import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' | 'dark' | 'system'
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to DOM
        const root = document.documentElement;
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.toggle('dark', systemTheme === 'dark');
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          const root = document.documentElement;
          root.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        });
      }
    }),
    {
      name: 'theme-storage'
    }
  )
);
