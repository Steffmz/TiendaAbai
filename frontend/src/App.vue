<template>
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
/* Los estilos base ahora se controlan desde style.css */
.app-container {
  min-height: 100vh;
  width: 100%;
  background-color: var(--bg);
  color: var(--text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>  