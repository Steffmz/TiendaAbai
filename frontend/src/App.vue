<template>
  <!-- Contenedor principal con fondo dinámico -->
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
.app-container {
  min-height: 100vh !important;
  width: 100% !important;
  background-color: var(--bg) !important;
  background: var(--bg) !important;
  color: var(--text) !important;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Fuerza específicamente en modo oscuro */
html.dark .app-container {
  background-color: #111318 !important;
  background: #111318 !important;
  color: #e5e7eb !important;
}

/* Y en modo claro también */
html:not(.dark) .app-container {
  background-color: #f5f7fb !important;
  background: #f5f7fb !important;
  color: #0f172a !important;
}
</style>