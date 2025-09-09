<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Variables de color */
:root {
  --primary: #4a90e2;
  --primary-contrast: #ffffff;
  --secondary: #e0e0e0;
  --text: #333333;
  --text-muted: #666666;
  --background: #f4f7f6;
  --surface: #ffffff;
  --surface-2: #f0f0f0;
  --border: #e0e0e0;
  --sidebar-bg: #2c3e50;
  --sidebar-link-hover: #34495e;
  --sidebar-link-active: #4a90e2;
  --table-header: #4a90e2;
}

/* Base styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background);
  color: var(--text);
  line-height: 1.6;
}

#app {
  display: flex;
  min-height: 100vh;
}

/* Estilo para el contenido de la página, aplica el padding superior aquí */
.page-content {
  flex-grow: 1;
  padding: 2rem; /* Este es el padding general que queremos */
  padding-top: calc(70px + 2rem); /* Suma la altura del navbar (70px) + el padding deseado */
  overflow-y: auto;
}

/* Utilidad para centrar contenido */
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.w-full {
  width: 100%;
}

/* Estilos de botones genéricos */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: var(--primary);
  color: var(--primary-contrast);
}

.btn-primary:hover {
  background-color: #3a7bd5;
}

.btn-secondary {
  background-color: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background-color: var(--border);
}

/* Modales */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--surface);
  color: var(--text);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh; /* Limita la altura del modal */
  overflow-y: auto; /* Permite scroll si el contenido es muy largo */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Formulario base */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-muted);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background-color: var(--surface-2);
  color: var(--text);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}
</style>