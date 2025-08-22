// src/theme.js
import { ref } from 'vue';

const isDark = ref(false);

function applyTheme(dark) {
  isDark.value = dark;
  const root = document.documentElement; // <html>
  const body = document.body;
  
  // Aplica o remueve la clase dark
  root.classList.toggle('dark', dark);
  
  // ⚠️ CORREGIDO: Los colores deben coincidir con CSS
  const bgColor = dark ? '#111318' : '#f5f7fb'; // Era '#e60e0eff'
  const textColor = dark ? '#e5e7eb' : '#0f172a';
  
  // NO forzar estilos inline, deja que CSS se encargue
  // Esto interfería con las variables CSS
  // root.style.backgroundColor = bgColor;
  // body.style.backgroundColor = bgColor;
  // body.style.color = textColor;
  
  // También fuerza en el app si existe (opcional, CSS ya lo maneja)
  // const app = document.getElementById('app');
  // if (app) {
  //   app.style.backgroundColor = bgColor;
  //   app.style.color = textColor;
  // }
  
  // Guarda preferencia del usuario
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  
  console.log('Tema aplicado:', dark ? 'oscuro' : 'claro'); // Para debug
}

export function initTheme() {
  // 1) Preferencia guardada del usuario
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') { 
    applyTheme(true); 
    return; 
  }
  if (saved === 'light') { 
    applyTheme(false); 
    return; 
  }

  // 2) Si no hay preferencia, sigue el sistema
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark);

  // 3) Si el usuario no fija preferencia, actualiza si cambia el sistema
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem('theme')) applyTheme(e.matches);
    };
    mq.addEventListener?.('change', handler);
  }
}

export function useTheme() {
  return {
    isDark,
    toggle: () => applyTheme(!isDark.value),
    setDark: () => applyTheme(true),
    setLight: () => applyTheme(false),
    followSystem: () => {
      localStorage.removeItem('theme');
      initTheme();
    }
  };
}