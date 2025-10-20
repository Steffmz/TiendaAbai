// src/theme.js
import { ref } from 'vue';

const isDark = ref(false);

function applyTheme(dark) {
  isDark.value = dark;
  const root = document.documentElement; 
  root.classList.toggle('dark', dark);
  
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    applyTheme(saved === 'dark');
    return;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark);

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches);
      }
    });
  }
}

export function useTheme() {
  return {
    isDark,
    toggle: () => applyTheme(!isDark.value),
  };
}